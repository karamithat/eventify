// /app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Event detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: {
        id: id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Event güncelleme (tüm data ile)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PUT method called for event:", params.id);

  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session || !session.user) {
      console.log("No session or user found");
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log("Update data received:", {
      title: body.title,
      category: body.category,
      isPublished: body.isPublished,
    });

    // Event'in var olduğunu kontrol et
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingEvent) {
      console.log("Event not found:", id);
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Authorization kontrolü - Eğer session.user.id varsa ve authorId eşleşmiyorsa
    if (
      session.user.id &&
      existingEvent.authorId &&
      existingEvent.authorId !== session.user.id
    ) {
      console.log("Authorization failed - User not owner");
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to edit this event",
        },
        { status: 403 }
      );
    }

    // Event'i güncelle
    const updatedEvent = await prisma.event.update({
      where: {
        id: id,
      },
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        startDate: new Date(body.startDate),
        startTime: body.startTime,
        endTime: body.endTime || null,
        location: body.location,
        venueName: body.venueName || null,
        venueAddress: body.venueAddress || null,
        venueCity: body.venueCity || null,
        eventType: body.eventType,
        ticketName: body.ticketName || null,
        ticketPrice: body.ticketPrice
          ? parseFloat(body.ticketPrice.toString())
          : null,
        imageUrl: body.imageUrl || null,
        isPublished: Boolean(body.isPublished),
        updatedAt: new Date(),
      },
    });

    console.log("Event updated successfully:", {
      id: updatedEvent.id,
      title: updatedEvent.title,
      isPublished: updatedEvent.isPublished,
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Event kısmi güncelleme (publish, unpublish vs.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PATCH method called for event:", params.id);

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log("PATCH data:", body);

    // Event'in var olduğunu kontrol et
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Authorization kontrolü
    if (
      session.user.id &&
      existingEvent.authorId &&
      existingEvent.authorId !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to edit this event",
        },
        { status: 403 }
      );
    }

    // Event'i güncelle (sadece gönderilen field'ları)
    const updatedEvent = await prisma.event.update({
      where: {
        id: id,
      },
      data: {
        ...body,
        updatedAt: new Date(),
        // Eğer isPublished gönderilmişse boolean'a çevir
        ...(body.hasOwnProperty("isPublished") && {
          isPublished: Boolean(body.isPublished),
        }),
      },
    });

    console.log("Event patched successfully:", updatedEvent.id);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error patching event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Event silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Event'in var olduğunu kontrol et
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Authorization kontrolü
    if (
      session.user.id &&
      existingEvent.authorId &&
      existingEvent.authorId !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete this event",
        },
        { status: 403 }
      );
    }

    // Event'i sil
    await prisma.event.delete({
      where: {
        id: id,
      },
    });

    console.log("Event deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
