import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma"; // prisma'yı doğru import ettiğinden emin ol.

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
}
