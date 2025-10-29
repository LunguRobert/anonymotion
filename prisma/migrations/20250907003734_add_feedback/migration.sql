-- CreateEnum
CREATE TYPE "public"."FeedbackType" AS ENUM ('BUG', 'FEATURE', 'PRAISE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."FeedbackType" NOT NULL,
    "rating" INTEGER,
    "message" TEXT NOT NULL,
    "email" VARCHAR(191),
    "from" TEXT NOT NULL DEFAULT 'app',
    "ip" VARCHAR(191),
    "ua" VARCHAR(512),
    "userId" VARCHAR(191),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_type_idx" ON "public"."Feedback"("createdAt", "type");

-- CreateIndex
CREATE INDEX "Feedback_from_idx" ON "public"."Feedback"("from");
