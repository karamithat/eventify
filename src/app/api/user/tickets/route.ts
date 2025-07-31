// app/api/user/tickets/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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

    // Önce Ticket modeli
    try {
      const tickets = await prisma.ticket.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: {
              author: {
                select: { name: true, email: true, image: true },
              },
            },
          },
          attendees: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(`✅ Found ${tickets.length} tickets via Ticket model`);

      const transformedTickets = tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        quantity: ticket.quantity,
        totalAmount: ticket.totalAmount,
        qrCode: ticket.qrCode,
        paymentStatus: ticket.paymentStatus,
        purchaseDate: ticket.purchaseDate.toISOString(),
        attendees: ticket.attendees.map((att) => ({
          id: att.id,
          fullName: att.fullName,
          email: att.email,
          phone: att.phone,
          checkedIn: att.checkedIn,
          checkInAt: att.checkInAt?.toISOString(),
        })),
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          description: ticket.event.description ?? null,
          category: ticket.event.category,
          startDate: ticket.event.startDate.toISOString(),
          endDate: ticket.event.endDate?.toISOString() ?? null,
          startTime: ticket.event.startTime,
          endTime: ticket.event.endTime ?? null,
          location: ticket.event.location,
          venueName: ticket.event.venueName ?? null,
          venueAddress: ticket.event.venueAddress ?? null,
          venueCity: ticket.event.venueCity ?? null,
          eventType: ticket.event.eventType,
          ticketName: ticket.event.ticketName ?? null,
          ticketPrice: ticket.event.ticketPrice ?? null,
          imageUrl: ticket.event.imageUrl ?? null,
          author: ticket.event.author, // { name, email, image }
        },
      }));

      return NextResponse.json({
        success: true,
        tickets: transformedTickets,
        count: transformedTickets.length,
      });
    } catch {
      // Ticket modeli yoksa EventRegistration'a düş
      console.log("⚠️ Ticket model not available, trying EventRegistration...");

      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: {
              author: {
                select: { name: true, email: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(
        `✅ Found ${registrations.length} registrations via EventRegistration model`
      );

      const transformedTickets = registrations.map((registration) => {
        // Status mapping
        const status =
          registration.status === "CANCELLED" ? "CANCELLED" : "ACTIVE"; // CONFIRMED/PENDING -> ACTIVE

        return {
          id: registration.id,
          ticketNumber: `REG-${registration.id}`,
          status,
          quantity: 1,
          totalAmount: 0,
          qrCode: `QR-${registration.id}-${Date.now()}`,
          paymentStatus: "COMPLETED",
          purchaseDate: registration.createdAt.toISOString(),
          attendees: [
            {
              id: `att-${registration.id}`,
              fullName: user.name ?? "Unknown",
              email: user.email,
              phone: null,
              checkedIn: false,
              checkInAt: null,
            },
          ],
          event: {
            id: registration.event.id,
            title: registration.event.title,
            description: registration.event.description ?? null,
            category: registration.event.category,
            startDate: registration.event.startDate.toISOString(),
            endDate: registration.event.endDate?.toISOString() ?? null,
            startTime: registration.event.startTime,
            endTime: registration.event.endTime ?? null,
            location: registration.event.location,
            venueName: registration.event.venueName ?? null,
            venueAddress: registration.event.venueAddress ?? null,
            venueCity: registration.event.venueCity ?? null,
            eventType: registration.event.eventType,
            ticketName: registration.event.ticketName ?? null,
            ticketPrice: registration.event.ticketPrice ?? null,
            imageUrl: registration.event.imageUrl ?? null,
            author: registration.event.author, // { name, email, image }
          },
        };
      });

      return NextResponse.json({
        success: true,
        tickets: transformedTickets,
        count: transformedTickets.length,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Error fetching user tickets:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
