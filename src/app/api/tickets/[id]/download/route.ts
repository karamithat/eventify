// app/api/tickets/[id]/download/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient, Prisma } from "@prisma/client";

type TicketTextData = {
  ticketNumber: string;
  qrCode: string;
  quantity: number;
  totalAmount: number;
  event: {
    title: string;
    category: string;
    startDate: Date;
    startTime: string;
    endTime?: string;
    location: string;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    eventType: string;
    author: {
      name?: string;
      email: string;
    };
  };
  attendees: {
    fullName: string;
    email: string;
    phone?: string | null;
  }[];
};

// Prisma’dan birleşik tipler
type TicketWithRelations = Prisma.TicketGetPayload<{
  include: { event: { include: { author: true } }; attendees: true };
}>;

type RegistrationWithRelations = Prisma.EventRegistrationGetPayload<{
  include: { event: { include: { author: true } } };
}>;

// Fallback olarak oluşturduğumuz "ticket benzeri" şekil
type FallbackTicketShape = {
  ticketNumber: string;
  qrCode: string;
  quantity: number;
  totalAmount: number;
  event: RegistrationWithRelations["event"];
  attendees: { fullName: string; email: string; phone: string | null }[];
};

function ticketToTextData(
  raw: TicketWithRelations | FallbackTicketShape
): TicketTextData {
  return {
    ticketNumber: raw.ticketNumber,
    qrCode: raw.qrCode,
    quantity: raw.quantity,
    totalAmount: raw.totalAmount,
    event: {
      title: raw.event.title,
      category: raw.event.category,
      startDate: raw.event.startDate, // Prisma DateTime -> Date
      startTime: raw.event.startTime,
      endTime: raw.event.endTime ?? undefined, // null'u undefined'a çevir
      location: raw.event.location,
      venueName: raw.event.venueName ?? undefined,
      venueAddress: raw.event.venueAddress ?? undefined,
      venueCity: raw.event.venueCity ?? undefined,
      eventType: raw.event.eventType,
      author: {
        name: raw.event.author?.name ?? undefined,
        email: raw.event.author.email,
      },
    },
    attendees: (raw.attendees || []).map((a) => ({
      fullName: a.fullName,
      email: a.email,
      phone: a.phone ?? undefined,
    })),
  };
}

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1) Ticket modeli
    let ticketData: TicketWithRelations | FallbackTicketShape | null =
      await prisma.ticket.findFirst({
        where: { id: params.id, userId: user.id },
        include: { event: { include: { author: true } }, attendees: true },
      });

    // 2) Yoksa EventRegistration fallback’i
    if (!ticketData) {
      const registration = await prisma.eventRegistration.findFirst({
        where: { id: params.id, userId: user.id },
        include: { event: { include: { author: true } } },
      });

      if (registration) {
        ticketData = {
          ticketNumber: `REG-${registration.id}`,
          qrCode: `QR-${registration.id}`,
          quantity: 1,
          totalAmount: 0,
          event: registration.event,
          attendees: [
            {
              fullName: user.name || "Unknown",
              email: user.email,
              phone: null,
            },
          ],
        };
      }
    }

    if (!ticketData) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const normalized = ticketToTextData(ticketData);
    const textContent = generateTicketText(normalized);

    const response = new NextResponse(textContent);
    response.headers.set("Content-Type", "text/plain");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="ticket-${normalized.ticketNumber}.txt"`
    );
    return response;
  } catch (err) {
    console.error("Error generating ticket:", err);
    return NextResponse.json(
      { error: "Failed to generate ticket" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateTicketText(ticket: TicketTextData) {
  const { event, attendees } = ticket;

  return `
=======================================
          EVENT TICKET
=======================================

Ticket Number: ${ticket.ticketNumber}
QR Code: ${ticket.qrCode}

---------------------------------------
EVENT DETAILS
---------------------------------------
Event: ${event.title}
Category: ${event.category}
Date: ${new Date(event.startDate).toLocaleDateString()}
Time: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}

Location: ${
    event.location === "Venue"
      ? `${event.venueName}\n${event.venueAddress}\n${event.venueCity}`
      : event.location
  }

---------------------------------------
TICKET INFORMATION
---------------------------------------
Type: ${event.eventType === "free" ? "FREE EVENT" : "PAID TICKET"}
${event.eventType !== "free" ? `Price: ₺${ticket.totalAmount}` : ""}
Quantity: ${ticket.quantity}

---------------------------------------
ATTENDEES
---------------------------------------
${attendees.map((a, i) => `${i + 1}. ${a.fullName} (${a.email})`).join("\n")}

---------------------------------------
ORGANIZER
---------------------------------------
Organized by: ${event.author.name || event.author.email}
Contact: ${event.author.email}

---------------------------------------
IMPORTANT NOTES
---------------------------------------
• Please arrive 15-30 minutes before the event
• Bring a valid ID for verification
• This ticket is non-transferable
• Show this ticket (or QR code) at the entrance

Generated on: ${new Date().toLocaleString()}
=======================================
  `.trim();
}
