/*
  Warnings:

  - You are about to drop the column `resetTokenExp` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "resetTokenExp",
ADD COLUMN     "refreshToken" TEXT;
