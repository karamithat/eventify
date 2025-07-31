import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VerifyQrBody = {
  qrCode?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyQrBody;
    const { qrCode } = body || {};

    if (!qrCode) {
      return NextResponse.json({ error: "QR code required" }, { status: 400 });
    }

    // QR kod ile bilet bul
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        attendees: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Invalid QR code" },
        { status: 404 }
      );
    }

    // Bilet durumu kontrolü
    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { valid: false, error: `Ticket is ${ticket.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Etkinlik zamanı kontrolü (ms cinsinden)
    const eventStartMs = new Date(ticket.event.startDate).getTime();
    const nowMs = Date.now();
    const eventEndMs = ticket.event.endDate
      ? new Date(ticket.event.endDate).getTime()
      : eventStartMs + 24 * 60 * 60 * 1000; // +24 saat

    // Check-in pencere mantığı: başlangıçtan 2 saat önce başlar
    if (nowMs < eventStartMs - 2 * 60 * 60 * 1000) {
      return NextResponse.json(
        { valid: false, error: "Too early for check-in" },
        { status: 400 }
      );
    }

    if (nowMs > eventEndMs) {
      return NextResponse.json(
        { valid: false, error: "Event has ended" },
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error verifying QR code:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
