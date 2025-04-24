// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../../lib/jwt";

type Data =
  | { error: string }
  | { token: string; user: { id: string; name: string | null; email: string } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Şifreyi doğrula
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // JWT üret
  const token = generateToken(user.id);

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
