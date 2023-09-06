/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Mobile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TagRFID` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Mobile_mac_userId_key";

-- DropIndex
DROP INDEX "TagRFID_tag_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_userId_key" ON "Mobile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TagRFID_userId_key" ON "TagRFID"("userId");
