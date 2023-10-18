/*
  Warnings:

  - Added the required column `microcontroller_type_id` to the `microcontroller` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_microcontroller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "microcontroller_type_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_microcontroller" ("active", "createdAt", "environmentId", "id", "ip", "mac", "updatedAt") SELECT "active", "createdAt", "environmentId", "id", "ip", "mac", "updatedAt" FROM "microcontroller";
DROP TABLE "microcontroller";
ALTER TABLE "new_microcontroller" RENAME TO "microcontroller";
CREATE UNIQUE INDEX "microcontroller_mac_key" ON "microcontroller"("mac");
CREATE UNIQUE INDEX "microcontroller_ip_key" ON "microcontroller"("ip");
CREATE UNIQUE INDEX "microcontroller_mac_ip_environmentId_key" ON "microcontroller"("mac", "ip", "environmentId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
