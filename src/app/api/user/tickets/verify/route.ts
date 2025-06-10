import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json({ error: "QR code required" }, { status: 400 });
    }

    // QR kod ile bilet bul
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        attendees: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid QR code",
        },
        { status: 404 }
      );
    }

    // Bilet durumu kontrolü
    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        {
          valid: false,
          error: `Ticket is ${ticket.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Etkinlik tarihi kontrolü
    const eventDate = new Date(ticket.event.startDate);
    const now = new Date();
    const eventEndDate = ticket.event.endDate
      ? new Date(ticket.event.endDate)
      : new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // 24 saat sonra

    if (now < eventDate.getTime() - 2 * 60 * 60 * 1000) {
      // 2 saat öncesinden
      return NextResponse.json(
        {
          valid: false,
          error: "Too early for check-in",
        },
        { status: 400 }
      );
    }

    if (now > eventEndDate) {
      return NextResponse.json(
        {
          valid: false,
          error: "Event has ended",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        quantity: ticket.quantity,
        attendees: ticket.attendees.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          email: a.email,
          checkedIn: a.checkedIn,
          checkInAt: a.checkInAt,
        })),
        event: {
          title: ticket.event.title,
          startDate: ticket.event.startDate,
          location: ticket.event.location,
          venueName: ticket.event.venueName,
        },
        user: ticket.user,
      },
    });
  } catch (error) {
    console.error("Error verifying QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
