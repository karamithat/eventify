// app/api/tickets/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

type AttendeeInput = {
  fullName?: string;
  email?: string;
  phone?: string | null;
};
type CreateTicketBody = {
  eventId: string;
  quantity: number;
  attendees?: AttendeeInput[];
  paymentId?: string | null;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { eventId, quantity, attendees, paymentId } =
      (await request.json()) as CreateTicketBody;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { author: true },
    });
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (!event.isPublished)
      return NextResponse.json(
        { error: "Event not published" },
        { status: 400 }
      );

    const totalAmount =
      event.eventType === "free"
        ? 0
        : (event.ticketPrice || 0) * (quantity || 1);

    const ticketNumber = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)
      .toUpperCase()}`;
    const qrCode = `QR-${uuidv4()}`;

    const result = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          ticketNumber,
          userId: user.id,
          eventId,
          quantity: quantity || 1,
          totalAmount,
          qrCode,
          paymentId: paymentId ?? null,
          paymentStatus:
            event.eventType === "free"
              ? "COMPLETED"
              : paymentId
              ? "COMPLETED"
              : "PENDING",
          status: "ACTIVE",
        },
      });

      if (attendees?.length) {
        const attendeeData = attendees.map((a: AttendeeInput) => ({
          ticketId: newTicket.id,
          fullName: a.fullName ?? "Unknown",
          email: a.email ?? user.email,
          phone: a.phone ?? null,
        }));
        await tx.ticketAttendee.createMany({ data: attendeeData });
      } else {
        await tx.ticketAttendee.create({
          data: {
            ticketId: newTicket.id,
            fullName: user.name || "Unknown",
            email: user.email,
            phone: null,
          },
        });
      }

      return newTicket;
    });

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.id,
      ticketNumber: result.ticketNumber,
      qrCode: result.qrCode,
    });
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Duplicate ticket number. Please try again." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
