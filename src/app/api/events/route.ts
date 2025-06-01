// app/api/events/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Event oluşturma
export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Request body'den event verilerini al
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
      imageUrl, // Fotoğraf URL'si eklendi
      isPublished = false,
    } = body;

    // Validation
    if (!title || !category || !startDate || !startTime || !location) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Venue seçilmişse venue bilgileri zorunlu
    if (location === "Venue" && (!venueName || !venueAddress || !venueCity)) {
      return NextResponse.json(
        { error: "Venue details are required for venue events" },
        { status: 400 }
      );
    }

    // Ticketed event ise ticket bilgileri zorunlu
    if (
      eventType === "ticketed" &&
      (!ticketName || ticketPrice === undefined)
    ) {
      return NextResponse.json(
        { error: "Ticket details are required for ticketed events" },
        { status: 400 }
      );
    }

    // User ID'sini al
    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "User identification not found in session" },
        { status: 400 }
      );
    }

    // Where clause'u güvenli şekilde oluştur
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

    // Kullanıcının var olduğunu kontrol et
    const user = await prisma.user.findUnique({
      where: whereClause,
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // DateTime objesi oluştur
    const eventStartDate = new Date(`${startDate}T${startTime}:00`);

    // End time varsa end date oluştur
    let eventEndDate = null;
    if (endTime) {
      eventEndDate = new Date(`${startDate}T${endTime}:00`);

      // End time start time'dan önce ise bir sonraki güne al
      if (eventEndDate <= eventStartDate) {
        eventEndDate.setDate(eventEndDate.getDate() + 1);
      }
    }

    // Event'i database'e kaydet
    const newEvent = await prisma.event.create({
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
        imageUrl: imageUrl || null, // Fotoğraf URL'si kaydet
        authorId: user.id,
        isPublished,
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
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error: unknown) {
    console.error("Error creating event:", error);

    // Prisma specific errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "Event with this title already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Kullanıcının eventlerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

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

    // Kullanıcının eventlerini getir
    const events = await prisma.event.findMany({
      where: {
        authorId: user.id,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: unknown) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
