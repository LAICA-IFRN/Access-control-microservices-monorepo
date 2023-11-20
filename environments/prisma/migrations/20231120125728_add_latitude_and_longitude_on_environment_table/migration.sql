/*
  Warnings:

  - Added the required column `latitude` to the `environment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `environment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_environment" ("active", "created_at", "created_by", "description", "id", "name", "updated_at") SELECT "active", "created_at", "created_by", "description", "id", "name", "updated_at" FROM "environment";
DROP TABLE "environment";
ALTER TABLE "new_environment" RENAME TO "environment";
CREATE UNIQUE INDEX "environment_name_key" ON "environment"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
