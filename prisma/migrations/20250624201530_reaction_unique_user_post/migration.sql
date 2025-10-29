/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_postId_userId_key" ON "Reaction"("postId", "userId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
