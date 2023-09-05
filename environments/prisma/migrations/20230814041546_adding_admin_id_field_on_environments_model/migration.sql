/*
  Warnings:

  - Added the required column `adminId` to the `Environment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Environment" ADD COLUMN     "adminId" TEXT NOT NULL;
