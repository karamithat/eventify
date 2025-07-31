// app/api/tickets/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
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

    // Kullanıcının kendi bileti mi?
    const ticket = await prisma.ticket.findFirst({
      where: { id: params.id, userId: user.id },
      include: { event: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // İptal edilebilir mi?
    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Ticket cannot be cancelled" },
        { status: 400 }
      );
    }

    // Etkinlik başlamış mı?
    const eventDate = new Date(ticket.event.startDate);
    if (eventDate <= new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel ticket for past events" },
        { status: 400 }
      );
    }

    // İptal et
    const cancelledTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "Ticket cancelled successfully",
      ticket: cancelledTicket,
    });
  } catch (err) {
    console.error("Error cancelling ticket:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
