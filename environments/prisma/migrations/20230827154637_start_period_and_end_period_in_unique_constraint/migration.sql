/*
  Warnings:

  - A unique constraint covering the columns `[day,startTime,endTime,userId,environmentId,startPeriod,endPeriod]` on the table `EnvAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EnvAccess_day_startTime_endTime_userId_environmentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "EnvAccess_day_startTime_endTime_userId_environmentId_startP_key" ON "EnvAccess"("day", "startTime", "endTime", "userId", "environmentId", "startPeriod", "endPeriod");
