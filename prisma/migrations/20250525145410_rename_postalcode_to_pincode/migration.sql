/*
  Warnings:

  - You are about to drop the column `postalCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "postalCode",
ADD COLUMN     "pincode" TEXT;
