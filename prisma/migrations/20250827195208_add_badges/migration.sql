/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."BadgeTier" AS ENUM ('common', 'rare', 'epic');

-- CreateEnum
CREATE TYPE "public"."BadgeScope" AS ENUM ('journal', 'feed');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Badge" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "tier" "public"."BadgeTier" NOT NULL,
    "scope" "public"."BadgeScope" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."UserBadge" (
    "userId" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("userId","badgeCode")
);

-- AddForeignKey
ALTER TABLE "public"."UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBadge" ADD CONSTRAINT "UserBadge_badgeCode_fkey" FOREIGN KEY ("badgeCode") REFERENCES "public"."Badge"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
