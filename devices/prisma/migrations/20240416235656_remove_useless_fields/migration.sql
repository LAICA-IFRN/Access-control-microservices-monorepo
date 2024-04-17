/*
  Warnings:

  - You are about to drop the column `mac` on the `mobile` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `mobile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mobile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_mobile" ("active", "created_at", "id", "updated_at", "user_id") SELECT "active", "created_at", "id", "updated_at", "user_id" FROM "mobile";
DROP TABLE "mobile";
ALTER TABLE "new_mobile" RENAME TO "mobile";
CREATE UNIQUE INDEX "mobile_user_id_key" ON "mobile"("user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
