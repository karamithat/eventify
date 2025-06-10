// app/api/tickets/[id]/download/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    console.log("📥 Ticket download API called for ticket:", params.id);

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

    // Ticket verisini getir
    let ticketData = null;

    try {
      // Önce Ticket modelini deneyelim
      ticketData = await prisma.ticket.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          event: {
            include: { author: true },
          },
          attendees: true,
        },
      });
    } catch (ticketError) {
      console.log("⚠️ Ticket model not available, trying EventRegistration...");

      // EventRegistration modelini deneyelim
      const registration = await prisma.eventRegistration.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          event: {
            include: { author: true },
          },
        },
      });

      if (registration) {
        // Registration'ı ticket formatına çevir
        ticketData = {
          id: registration.id,
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

    console.log("✅ Ticket found, generating PDF...");

    // Simple HTML-based PDF content oluştur
    const htmlContent = generateTicketHTML(ticketData);

    // Simple text-based ticket dosyası oluştur (PDF yerine)
    const textContent = generateTicketText(ticketData);

    // Text dosyası olarak döndür
    const response = new NextResponse(textContent);
    response.headers.set("Content-Type", "text/plain");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="ticket-${ticketData.ticketNumber}.txt"`
    );

    console.log("✅ Ticket file generated successfully");
    return response;
  } catch (error) {
    console.error("❌ Error generating ticket download:", error);
    return NextResponse.json(
      { error: "Failed to generate ticket: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateTicketText(ticket) {
  const event = ticket.event;
  const attendees = ticket.attendees || [];

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
${attendees
  .map(
    (attendee, index) =>
      `${index + 1}. ${attendee.fullName} (${attendee.email})`
  )
  .join("\n")}

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

function generateTicketHTML(ticket) {
  const event = ticket.event;
  const attendees = ticket.attendees || [];

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Event Ticket - ${ticket.ticketNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .ticket { border: 2px solid #333; padding: 20px; max-width: 600px; }
        .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .section { margin: 15px 0; }
        .qr-placeholder { border: 1px dashed #ccc; padding: 20px; text-align: center; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>EVENT TICKET</h1>
            <p>Ticket #${ticket.ticketNumber}</p>
        </div>
        
        <div class="section">
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${new Date(
              event.startDate
            ).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.startTime}</p>
            <p><strong>Location:</strong> ${
              event.location === "Venue"
                ? `${event.venueName}, ${event.venueAddress}, ${event.venueCity}`
                : event.location
            }</p>
        </div>
        
        <div class="section">
            <h3>Attendees</h3>
            ${attendees
              .map(
                (attendee, index) =>
                  `<p>${index + 1}. ${attendee.fullName} - ${
                    attendee.email
                  }</p>`
              )
              .join("")}
        </div>
        
        <div class="qr-placeholder">
            <p>QR Code: ${ticket.qrCode}</p>
            <p>Show this at the entrance</p>
        </div>
        
        <div class="section">
            <small>Generated on ${new Date().toLocaleString()}</small>
        </div>
    </div>
</body>
</html>
  `;
}
