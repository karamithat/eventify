// src/lib/auth/adapter.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient, User } from "@prisma/client";

export function CustomPrismaAdapter(prisma: PrismaClient) {
  const originalAdapter = PrismaAdapter(prisma);

  return {
    ...originalAdapter,
    createUser: async (user: User) => {
      // Burada özel user creation logic ekleyebilirsiniz
      const createdUser = await prisma.user.create({
        data: {
          ...user,
          // Gerekirse default değerler ekleyebilirsiniz
        },
      });
      return createdUser;
    },
  };
}
