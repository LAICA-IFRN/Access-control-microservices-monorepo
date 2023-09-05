/*
  Warnings:

  - Added the required column `endPeriod` to the `EnvAccess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnvAccess" ADD COLUMN     "endPeriod" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startPeriod" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
