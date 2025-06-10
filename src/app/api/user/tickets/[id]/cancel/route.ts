import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Bilet kontrolü
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // İptal edilebilir mi kontrol et
    if (ticket.status !== "ACTIVE") {
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
    const cancelledTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    // İade işlemi burada yapılabilir (payment gateway entegrasyonu)
    // if (ticket.paymentStatus === 'COMPLETED' && ticket.totalAmount > 0) {
    //   await processRefund(ticket.paymentId, ticket.totalAmount);
    // }

    return NextResponse.json({
      message: "Ticket cancelled successfully",
      ticket: cancelledTicket,
    });
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
