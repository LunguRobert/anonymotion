-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "journalLockEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "journalLockHint" TEXT,
ADD COLUMN     "journalPasswordHash" TEXT;
