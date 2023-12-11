/*
  Warnings:

  - Added the required column `end_period` to the `environment_temporary_access` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `environment_temporary_access` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_environment_temporary_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "start_period" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_period" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_temporary_access_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_environment_temporary_access" ("active", "created_at", "created_by", "description", "environment_id", "id", "updated_at", "user_id") SELECT "active", "created_at", "created_by", "description", "environment_id", "id", "updated_at", "user_id" FROM "environment_temporary_access";
DROP TABLE "environment_temporary_access";
ALTER TABLE "new_environment_temporary_access" RENAME TO "environment_temporary_access";
CREATE UNIQUE INDEX "environment_temporary_access_user_id_environment_id_key" ON "environment_temporary_access"("user_id", "environment_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
