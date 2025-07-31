// app/api/user/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

type UpdateProfileBody = {
  name: string;
  website?: string | null;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  pincode?: string | null;
  // photo?: string | null; // Kullanılmıyorsa eklemeyin
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateProfileBody = await req.json();
    console.log("Received data:", body);

    const { name, website, company, phone, address, city, country, pincode } =
      body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const updateData = {
      name: name.trim(),
      website: website?.trim() || null,
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      country: country?.trim() || null,
      pincode: pincode?.trim() || null,
    };

    console.log("Update data:", updateData);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
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
        pincode: true,
        updatedAt: true,
      },
    });

    console.log("Updated user:", updatedUser);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err: unknown) {
    // Güvenli daraltma
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("Profile update error:", message);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

// Diğer HTTP metodları için 405
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
