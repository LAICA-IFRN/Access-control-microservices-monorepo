/*
  Warnings:

  - You are about to drop the column `day` on the `EnvAccess` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `EnvAccess` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `EnvAccess` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Environment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,environmentId]` on the table `EnvAccess` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `EnvAccess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `EnvManager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Environment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EnvAccess_day_startTime_endTime_userId_environmentId_startP_key";

-- AlterTable
ALTER TABLE "EnvAccess" DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EnvManager" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Environment" DROP COLUMN "adminId",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Access" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "envAccessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "envManagerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Access_day_startTime_endTime_envAccessId_key" ON "Access"("day", "startTime", "endTime", "envAccessId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvAccess_userId_environmentId_key" ON "EnvAccess"("userId", "environmentId");

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_envAccessId_fkey" FOREIGN KEY ("envAccessId") REFERENCES "EnvAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_envManagerId_fkey" FOREIGN KEY ("envManagerId") REFERENCES "EnvManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
