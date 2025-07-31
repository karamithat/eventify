// /api/tickets/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
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
  quantity?: number;
  attendees?: AttendeeInput[];
  paymentId?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    console.log("🎫 Ticket creation API called");

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      console.log("❌ User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await req.json()) as Partial<CreateTicketBody>;
    const { eventId, paymentId } = body;
    const quantity =
      typeof body.quantity === "number" && body.quantity > 0
        ? Math.floor(body.quantity)
        : 1;
    const attendees: AttendeeInput[] = Array.isArray(body.attendees)
      ? body.attendees
      : [];

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Event kontrolü
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { author: true },
    });
    if (!event) {
      console.log("❌ Event not found:", eventId);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (!event.isPublished) {
      console.log("❌ Event not published:", eventId);
      return NextResponse.json(
        { error: "Event not published" },
        { status: 400 }
      );
    }
    console.log("✅ Event found:", event.title);

    // Fiyat hesaplama
    const totalAmount =
      event.eventType === "free" ? 0 : (event.ticketPrice || 0) * quantity;

    // Unique ticket number ve QR code
    const ticketNumber = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)
      .toUpperCase()}`;
    const qrCode = `QR-${uuidv4()}`;

    console.log("🎟️ Creating ticket:", { ticketNumber, totalAmount, qrCode });

    // Transaction ile bilet oluştur
    const result = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          ticketNumber,
          userId: user.id,
          eventId,
          quantity,
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

      console.log("✅ Ticket created:", newTicket.id);

      if (attendees.length > 0) {
        const attendeeData = attendees.map((a) => ({
          ticketId: newTicket.id,
          fullName: a.fullName || "Unknown",
          email: a.email || user.email,
          phone: a.phone ?? null,
        }));

        await tx.ticketAttendee.createMany({ data: attendeeData });
        console.log("✅ Attendees created:", attendeeData.length);
      } else {
        // Fallback: kullanıcı için tek attendee
        await tx.ticketAttendee.create({
          data: {
            ticketId: newTicket.id,
            fullName: user.name || "Unknown",
            email: user.email,
            phone: null,
          },
        });
        console.log("✅ Default attendee created for user");
      }

      return newTicket;
    });

    console.log("🎉 Transaction completed successfully");

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.id,
      ticketNumber: result.ticketNumber,
      qrCode: result.qrCode,
    });
  } catch (err: unknown) {
    console.error("❌ Error creating ticket:", err);

    // Prisma unique constraint
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Duplicate ticket number. Please try again." },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
