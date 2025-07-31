// app/api/tickets/[id]/check-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attendeeId } = (await request.json()) as { attendeeId?: string };
    if (!attendeeId) {
      return NextResponse.json(
        { error: "attendeeId is required" },
        { status: 400 }
      );
    }

    // Bilet kontrolü
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { event: true, attendees: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Ticket is not active" },
        { status: 400 }
      );
    }

    // Attendee kontrolü
    const attendee = ticket.attendees.find((a) => a.id === attendeeId);
    if (!attendee) {
      return NextResponse.json(
        { error: "Attendee not found" },
        { status: 404 }
      );
    }
    if (attendee.checkedIn) {
      return NextResponse.json(
        { error: "Attendee already checked in" },
        { status: 400 }
      );
    }

    // Check-in
    const updatedAttendee = await prisma.ticketAttendee.update({
      where: { id: attendeeId },
      data: { checkedIn: true, checkInAt: new Date() },
    });

    // Tüm attendees check-in olduysa bileti USED yap
    const allCheckedIn = ticket.attendees.every(
      (a) => a.id === attendeeId || a.checkedIn
    );
    if (allCheckedIn) {
      await prisma.ticket.update({
        where: { id: params.id },
        data: { status: "USED" },
      });
    }

    return NextResponse.json({
      message: "Check-in successful",
      attendee: updatedAttendee,
      allCheckedIn,
    });
  } catch (err) {
    console.error("Error during check-in:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
