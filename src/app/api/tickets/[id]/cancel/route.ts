// app/api/tickets/[id]/cancel/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    console.log("🚫 Cancel ticket API called for ticket:", params.id);

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

    // Önce Ticket modelini deneyelim
    let ticket = null;
    let isTicketModel = false;

    try {
      ticket = await prisma.ticket.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          event: true,
        },
      });
      isTicketModel = true;
      console.log("✅ Found ticket via Ticket model");
    } catch (ticketError) {
      console.log("⚠️ Ticket model not available, trying EventRegistration...");

      // EventRegistration modelini deneyelim
      const registration = await prisma.eventRegistration.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          event: true,
        },
      });

      if (registration) {
        ticket = {
          id: registration.id,
          status: registration.status === "CONFIRMED" ? "ACTIVE" : "CANCELLED",
          event: registration.event,
          totalAmount: 0,
        };
        isTicketModel = false;
        console.log("✅ Found registration via EventRegistration model");
      }
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // İptal edilebilir mi kontrol et
    if (ticket.status !== "ACTIVE" && ticket.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Ticket cannot be cancelled" },
        { status: 400 }
      );
    }

    // Etkinlik başlamış mı kontrol et
    const eventDate = new Date(ticket.event.startDate);
    const now = new Date();

    if (eventDate <= now) {
      return NextResponse.json(
        { error: "Cannot cancel ticket for past events" },
        { status: 400 }
      );
    }

    // İptal et
    let cancelledTicket;

    if (isTicketModel) {
      // Ticket modelini kullan
      cancelledTicket = await prisma.ticket.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });
      console.log("✅ Ticket cancelled via Ticket model");
    } else {
      // EventRegistration modelini kullan
      cancelledTicket = await prisma.eventRegistration.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
        },
      });
      console.log("✅ Registration cancelled via EventRegistration model");
    }

    return NextResponse.json({
      success: true,
      message: "Ticket cancelled successfully",
      ticket: cancelledTicket,
    });
  } catch (error) {
    console.error("❌ Error cancelling ticket:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
