// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Prisma client'ı global olarak tanımla
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Production ortamında singleton pattern
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
