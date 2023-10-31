/*
  Warnings:

  - You are about to drop the column `access_by` on the `access` table. All the data in the column will be lost.
  - You are about to drop the column `environment_id` on the `access` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `access` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_access" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" TEXT
);
INSERT INTO "new_access" ("created_at", "id", "message", "meta", "type") SELECT "created_at", "id", "message", "meta", "type" FROM "access";
DROP TABLE "access";
ALTER TABLE "new_access" RENAME TO "access";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
