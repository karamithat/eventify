// /api/tickets/create/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(request) {
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

    const body = await request.json();
    const { eventId, quantity, attendees, paymentId } = body;

    console.log("📝 Request data:", {
      eventId,
      quantity,
      attendees: attendees?.length,
      paymentId,
    });

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

    // Unique ticket number ve QR code oluştur
    const ticketNumber = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    const qrCode = `QR-${uuidv4()}`;

    console.log("🎟️ Creating ticket:", { ticketNumber, totalAmount, qrCode });

    // Transaction ile bilet oluştur
    const result = await prisma.$transaction(async (prisma) => {
      // Bilet oluştur
      const newTicket = await prisma.ticket.create({
        data: {
          ticketNumber,
          userId: user.id,
          eventId: eventId,
          quantity: quantity || 1,
          totalAmount,
          qrCode,
          paymentId: paymentId || null,
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

      // Attendees oluştur
      if (attendees && attendees.length > 0) {
        const attendeeData = attendees.map((attendee) => ({
          ticketId: newTicket.id,
          fullName: attendee.fullName || "Unknown",
          email: attendee.email || user.email,
          phone: attendee.phone || null,
        }));

        await prisma.ticketAttendee.createMany({
          data: attendeeData,
        });

        console.log("✅ Attendees created:", attendeeData.length);
      } else {
        // Fallback: kullanıcının kendisi için attendee oluştur
        await prisma.ticketAttendee.create({
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

    // Email gönderme işlemi burada yapılabilir
    // await sendTicketConfirmationEmail(user.email, ticket, event);

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.id,
      ticketNumber: result.ticketNumber,
      qrCode: result.qrCode,
    });
  } catch (error) {
    console.error("❌ Error creating ticket:", error);

    // Specific error handling
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate ticket number. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
