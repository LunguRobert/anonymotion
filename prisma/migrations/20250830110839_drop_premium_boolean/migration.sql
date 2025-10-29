/*
  Warnings:

  - You are about to drop the column `premium` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "premium",
ADD COLUMN     "plan" "public"."Plan" NOT NULL DEFAULT 'FREE';
