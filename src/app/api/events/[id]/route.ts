// app/api/events/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Event'i ID ile getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const eventId = params.id;

    // Event'i getir
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registrations: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Kullanıcının kendi eventi olduğunu kontrol et
    const userId = session.user.id;
    const userEmail = session.user.email;

    const whereClause = userId
      ? { id: userId }
      : userEmail
      ? { email: userEmail }
      : null;

    if (!whereClause) {
      return NextResponse.json(
        { error: "No valid user identifier found" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: { id: true },
    });

    if (!user || event.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only access your own events" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: unknown) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Event'i güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const eventId = params.id;
    const body = await request.json();
    const {
      title,
      category,
      startDate,
      startTime,
      endTime,
      location,
      venueName,
      venueAddress,
      venueCity,
      description,
      eventType,
      ticketName,
      ticketPrice,
      imageUrl,
      isPublished,
    } = body;

    // Validation
    if (!title || !category || !startDate || !startTime || !location) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Venue validation
    if (location === "Venue" && (!venueName || !venueAddress || !venueCity)) {
      return NextResponse.json(
        { error: "Venue details are required for venue events" },
        { status: 400 }
      );
    }

    // Ticket validation
    if (
      eventType === "ticketed" &&
      (!ticketName || ticketPrice === undefined)
    ) {
      return NextResponse.json(
        { error: "Ticket details are required for ticketed events" },
        { status: 400 }
      );
    }

    // User verification
    const userId = session.user.id;
    const userEmail = session.user.email;

    const whereClause = userId
      ? { id: userId }
      : userEmail
      ? { email: userEmail }
      : null;

    if (!whereClause) {
      return NextResponse.json(
        { error: "No valid user identifier found" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Event ownership kontrolü
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { authorId: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own events" },
        { status: 403 }
      );
    }

    // DateTime objesi oluştur
    const eventStartDate = new Date(`${startDate}T${startTime}:00`);

    let eventEndDate = null;
    if (endTime) {
      eventEndDate = new Date(`${startDate}T${endTime}:00`);

      if (eventEndDate <= eventStartDate) {
        eventEndDate.setDate(eventEndDate.getDate() + 1);
      }
    }

    // Event'i güncelle
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        category,
        startDate: eventStartDate,
        endDate: eventEndDate,
        startTime,
        endTime,
        location,
        venueName: location === "Venue" ? venueName : null,
        venueAddress: location === "Venue" ? venueAddress : null,
        venueCity: location === "Venue" ? venueCity : null,
        description: description || null,
        eventType,
        ticketName: eventType === "ticketed" ? ticketName : null,
        ticketPrice: eventType === "ticketed" ? parseFloat(ticketPrice) : null,
        imageUrl: imageUrl || null,
        isPublished: isPublished !== undefined ? isPublished : false,
        updatedAt: new Date(),
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

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error: unknown) {
    console.error("Error updating event:", error);

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Event'i sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const eventId = params.id;

    // User verification
    const userId = session.user.id;
    const userEmail = session.user.email;

    const whereClause = userId
      ? { id: userId }
      : userEmail
      ? { email: userEmail }
      : null;

    if (!whereClause) {
      return NextResponse.json(
        { error: "No valid user identifier found" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Event ownership kontrolü
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        authorId: true,
        title: true,
        registrations: {
          select: { id: true },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    // Eğer event'e kayıt yapan varsa uyarı ver (opsiyonel)
    if (existingEvent.registrations.length > 0) {
      console.log(
        `Deleting event "${existingEvent.title}" with ${existingEvent.registrations.length} registrations`
      );
    }

    // Önce ilişkili kayıtları sil (Foreign key constraint)
    await prisma.eventRegistration.deleteMany({
      where: {
        eventId: eventId,
      },
    });

    // Sonra event'i sil
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting event:", error);

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
