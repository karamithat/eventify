// app/api/user/interests/route.js
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"; // Auth config'inizin yolu
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Kullanıcının mevcut ilgi alanlarını getir
export async function GET() {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    console.log("Session user:", session.user); // Debug için

    // User ID'sini al - session.user.id mevcut
    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "User identification not found in session" },
        { status: 400 }
      );
    }

    // Kullanıcının ilgi alanlarını getir - ID varsa ID ile, yoksa email ile
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
      select: {
        id: true,
        email: true,
        interests: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interests: user.interests || [],
    });
  } catch (error: unknown) {
    console.error("Error fetching user interests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Kullanıcının ilgi alanlarını kaydet/güncelle
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

    console.log("Session user:", session.user); // Debug için

    // Request body'den interests'i al
    const body = await request.json();
    const { interests } = body;

    // Validation
    if (!interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Interests must be an array" },
        { status: 400 }
      );
    }

    if (interests.length === 0) {
      return NextResponse.json(
        { error: "At least one interest must be selected" },
        { status: 400 }
      );
    }

    // User ID'sini al - session.user.id mevcut
    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userId && !userEmail) {
      console.error("User identification not found:", session.user);
      return NextResponse.json(
        { error: "User identification not found in session" },
        { status: 400 }
      );
    }

    // İlgi alanlarının geçerli olup olmadığını kontrol et (opsiyonel)
    const validInterests = [
      "Concerts",
      "Music Festivals",
      "Music Workshops",
      "DJ Nights",
      "Art Exhibitions",
      "Cultural Festivals",
      "Theater Plays",
      "Dance Performances",
      "Food Festivals",
      "Wine Tasting",
      "Cooking Classes",
      "Beer Festivals",
      "Marathons",
      "Yoga Sessions",
      "Fitness Workshops",
      "Sporting Events",
      "Conferences",
      "Seminars",
      "Workshops",
      "Networking Events",
      "Family-Friendly Events",
      "Children Workshops",
      "Kids-Friendly Shows",
      "Educational Activities",
      "Tech Conferences",
      "Hackathons",
      "Startup Events",
      "Gadget Expos",
      "Stand-up Comedy",
      "Improv Nights",
      "Comedy Festivals",
      "Magic Shows",
      "Fundraising Events",
      "Charity Galas",
      "Benefit Concerts",
      "Auctions & Fundraisers",
      "Lectures & Talks",
      "Workshops",
      "Educational Seminars",
      "Skill Building Sessions",
      "City Tours",
      "Adventure Travel",
      "Cultural Experiences",
      "Cruise Vacations",
    ];

    const invalidInterests = interests.filter(
      (interest) => !validInterests.includes(interest)
    );
    if (invalidInterests.length > 0) {
      return NextResponse.json(
        { error: `Invalid interests: ${invalidInterests.join(", ")}` },
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

    // Kullanıcının ilgi alanlarını güncelle
    const updatedUser = await prisma.user.update({
      where: whereClause,
      data: {
        interests: interests,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        interests: true,
        updatedAt: true,
      },
    });

    // Log kaydet (opsiyonel)
    console.log(`User ${updatedUser.id} updated interests:`, interests);

    return NextResponse.json({
      success: true,
      message: "Interests updated successfully",
      data: {
        userId: updatedUser.id,
        interests: updatedUser.interests,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating user interests:", error);

    // Prisma specific errors - tip güvenli kontrol
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - POST ile aynı (opsiyonel)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// DELETE - Kullanıcının tüm ilgi alanlarını sil
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
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

    await prisma.user.update({
      where: whereClause,
      data: {
        interests: [],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "All interests cleared successfully",
    });
  } catch (error: unknown) {
    console.error("Error clearing user interests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
