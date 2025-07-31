// app/api/tickets/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient, Prisma } from "@prisma/client";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const runtime = "nodejs"; // PDFKit için Node runtime

const prisma = new PrismaClient();

type TicketWithEvent = Prisma.TicketGetPayload<{
  include: {
    event: { include: { author: true } };
    attendees: true;
  };
}>;

export async function GET(
  _request: NextRequest,
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

    const ticket = await prisma.ticket.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        event: { include: { author: true } },
        attendees: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // PDF oluştur
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    return new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        const response = new NextResponse(pdfBuffer);
        response.headers.set("Content-Type", "application/pdf");
        response.headers.set(
          "Content-Disposition",
          `attachment; filename="ticket-${ticket.ticketNumber}.pdf"`
        );
        resolve(response);
      });

      generateTicketPDF(doc, ticket);
      doc.end();
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PDF oluşturma yardımcı fonksiyonu
async function generateTicketPDF(
  doc: PDFKit.PDFDocument,
  ticket: TicketWithEvent
) {
  const event = ticket.event;

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("EVENT TICKET", 50, 50);
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Ticket #${ticket.ticketNumber}`, 400, 55);

  // Event Title
  doc.fontSize(20).font("Helvetica-Bold").text(event.title, 50, 100);

  // Event Details
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Category: ${event.category}`, 50, 140)
    .text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, 50, 160)
    .text(
      `Time: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`,
      50,
      180
    );

  // Location
  const location =
    event.location === "Venue"
      ? `${event.venueName || ""}, ${event.venueAddress || ""}, ${
          event.venueCity || ""
        }`
      : event.location;
  doc.text(`Location: ${location}`, 50, 200);

  // Price / Quantity
  if (event.eventType === "ticketed") {
    doc.text(`Price: ₺${ticket.totalAmount}`, 50, 220);
    doc.text(`Quantity: ${ticket.quantity}`, 50, 240);
  } else {
    doc.text("FREE EVENT", 50, 220);
  }

  // Attendees
  doc.fontSize(14).font("Helvetica-Bold").text("Attendees:", 50, 280);
  let yPos = 300;
  ticket.attendees.forEach(
    (attendee: TicketWithEvent["attendees"][number], index: number) => {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `${index + 1}. ${attendee.fullName} - ${attendee.email}`,
          70,
          yPos
        );
      yPos += 20;
    }
  );

  // QR Code
  try {
    const qrCodeDataURL = await QRCode.toDataURL(ticket.qrCode);
    const qrCodeBase64 = qrCodeDataURL.split(",")[1];
    const qrCodeBuffer = Buffer.from(qrCodeBase64, "base64");

    doc.image(qrCodeBuffer, 400, 300, { width: 120, height: 120 });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Scan this QR code at the entrance", 400, 430);
  } catch (e) {
    console.error("Error generating QR code:", e);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`QR Code: ${ticket.qrCode}`, 400, 350);
  }

  // Footer
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(`Generated on ${new Date().toLocaleString()}`, 50, 750)
    .text(`Organized by ${event.author.name || event.author.email}`, 50, 765);

  // Terms
  doc
    .fontSize(8)
    .text("Please arrive 15-30 minutes before the event starts.", 50, 790)
    .text(
      "This ticket is non-transferable and must be presented with valid ID.",
      50,
      805
    );
}
