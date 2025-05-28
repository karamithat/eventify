// app/api/user/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Kullanıcının oturum açıp açmadığını kontrol et
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Request body'den verileri al
    const body = await req.json();
    console.log("Received data:", body); // Debug için log ekleyelim

    const {
      name,
      website,
      company,
      phone,
      address,
      city,
      country,
      pincode, // Frontend'den pincode gelecek
      photo,
    } = body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Update data object'ini oluştur
    const updateData = {
      name: name.trim(),
      website: website?.trim() || null,
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      country: country?.trim() || null,
      pincode: pincode?.trim() || null, // pincode olarak kullan
    };

    console.log("Update data:", updateData); // Debug için log ekleyelim

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        website: true,
        company: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        pincode: true, // pincode olarak seç
        updatedAt: true,
      },
    });

    console.log("Updated user:", updatedUser); // Debug için log ekleyelim

    // Başarılı güncelleme
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    // Prisma hataları için özel mesajlar
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Diğer HTTP metodları için 405 döndür
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
