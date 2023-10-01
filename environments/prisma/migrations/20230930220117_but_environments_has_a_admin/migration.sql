/*
  Warnings:

  - Added the required column `createdBy` to the `Environment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Environment" ADD COLUMN     "createdBy" TEXT NOT NULL;
