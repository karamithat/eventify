/*
  Warnings:

  - You are about to drop the column `price` on the `Event` table. All the data in the column will be lost.
  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "price",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "ticketName" TEXT,
ADD COLUMN     "ticketPrice" DOUBLE PRECISION,
ADD COLUMN     "venueAddress" TEXT,
ADD COLUMN     "venueCity" TEXT,
ADD COLUMN     "venueName" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "capacity" DROP NOT NULL;
