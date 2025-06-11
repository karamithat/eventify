// app/api/user/tickets/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log("🎫 User tickets API called");

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

    console.log("✅ Fetching tickets for user:", user.id);

    // Önce Ticket modeli ile deneyalim
    let tickets = [];

    try {
      tickets = await prisma.ticket.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: {
              author: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          attendees: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(`✅ Found ${tickets.length} tickets via Ticket model`);

      // Transform data for frontend
      const transformedTickets = tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        qrCode: ticket.qrCode,
        paymentStatus: ticket.paymentStatus,
        purchaseDate: ticket.purchaseDate.toISOString(),
        attendees: ticket.attendees.map((attendee) => ({
          id: attendee.id,
          fullName: attendee.fullName,
          email: attendee.email,
          phone: attendee.phone,
          checkedIn: attendee.checkedIn,
          checkInAt: attendee.checkInAt?.toISOString(),
        })),
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          description: ticket.event.description,
          category: ticket.event.category,
          startDate: ticket.event.startDate.toISOString(),
          endDate: ticket.event.endDate?.toISOString(),
          startTime: ticket.event.startTime,
          endTime: ticket.event.endTime,
          location: ticket.event.location,
          venueName: ticket.event.venueName,
          venueAddress: ticket.event.venueAddress,
          venueCity: ticket.event.venueCity,
          eventType: ticket.event.eventType,
          ticketName: ticket.event.ticketName,
          ticketPrice: ticket.event.ticketPrice,
          imageUrl: ticket.event.imageUrl,
          author: ticket.event.author,
        },
      }));

      return NextResponse.json({
        success: true,
        tickets: transformedTickets,
        count: transformedTickets.length,
      });
    } catch (ticketError) {
      console.log("⚠️ Ticket model not available, trying EventRegistration...");

      // EventRegistration modeli ile deneyalim
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: {
              author: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(
        `✅ Found ${registrations.length} registrations via EventRegistration model`
      );

      // Transform registrations to ticket format
      const transformedTickets = registrations.map((registration) => {
        // Status mapping: CONFIRMED -> ACTIVE, CANCELLED -> CANCELLED, PENDING -> ACTIVE
        let status = "ACTIVE";
        if (registration.status === "CANCELLED") {
          status = "CANCELLED";
        } else if (registration.status === "CONFIRMED") {
          status = "ACTIVE";
        }

        return {
          id: registration.id,
          ticketNumber: `REG-${registration.id}`,
          status: status,
          quantity: 1,
          totalAmount: 0,
          qrCode: `QR-${registration.id}-${Date.now()}`,
          paymentStatus: "COMPLETED",
          purchaseDate: registration.createdAt.toISOString(),
          attendees: [
            {
              id: `att-${registration.id}`,
              fullName: user.name || "Unknown",
              email: user.email,
              phone: null,
              checkedIn: false,
              checkInAt: null,
            },
          ],
          event: {
            id: registration.event.id,
            title: registration.event.title,
            description: registration.event.description,
            category: registration.event.category,
            startDate: registration.event.startDate.toISOString(),
            endDate: registration.event.endDate?.toISOString(),
            startTime: registration.event.startTime,
            endTime: registration.event.endTime,
            location: registration.event.location,
            venueName: registration.event.venueName,
            venueAddress: registration.event.venueAddress,
            venueCity: registration.event.venueCity,
            eventType: registration.event.eventType,
            ticketName: registration.event.ticketName,
            ticketPrice: registration.event.ticketPrice,
            imageUrl: registration.event.imageUrl,
            author: registration.event.author,
          },
        };
      });

      return NextResponse.json({
        success: true,
        tickets: transformedTickets,
        count: transformedTickets.length,
      });
    }
  } catch (error) {
    console.error("❌ Error fetching user tickets:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
