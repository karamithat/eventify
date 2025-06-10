// /api/user/tickets/route.js
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

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.id,
      },
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

    console.log(`✅ Found ${tickets.length} tickets for user`);

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
