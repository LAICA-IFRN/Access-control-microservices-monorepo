/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `EnvAccess` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[day,startTime,endTime,userId,environmentId]` on the table `EnvAccess` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `EnvAccess` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EnvAccess_dayOfWeek_startTime_endTime_userId_environmentId_key";

-- AlterTable
ALTER TABLE "EnvAccess" DROP COLUMN "dayOfWeek",
ADD COLUMN     "day" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EnvAccess_day_startTime_endTime_userId_environmentId_key" ON "EnvAccess"("day", "startTime", "endTime", "userId", "environmentId");
