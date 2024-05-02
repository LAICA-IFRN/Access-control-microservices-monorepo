/*
  Warnings:

  - You are about to drop the column `permant_access` on the `environment_user_access_control` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_environment_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permanent_access" BOOLEAN NOT NULL DEFAULT false,
    "start_period" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_period" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_user_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_environment_user" ("active", "created_at", "created_by", "end_period", "environment_id", "id", "start_period", "updated_at", "user_id", "user_name") SELECT "active", "created_at", "created_by", "end_period", "environment_id", "id", "start_period", "updated_at", "user_id", "user_name" FROM "environment_user";
DROP TABLE "environment_user";
ALTER TABLE "new_environment_user" RENAME TO "environment_user";
CREATE UNIQUE INDEX "environment_user_user_id_environment_id_key" ON "environment_user"("user_id", "environment_id");
CREATE TABLE "new_environment_user_access_control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "no_access_restrict" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "environment_user_id" TEXT,
    "environment_temporary_access_id" TEXT,
    CONSTRAINT "environment_user_access_control_environment_user_id_fkey" FOREIGN KEY ("environment_user_id") REFERENCES "environment_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "environment_user_access_control_environment_temporary_access_id_fkey" FOREIGN KEY ("environment_temporary_access_id") REFERENCES "environment_temporary_access" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_environment_user_access_control" ("active", "created_at", "day", "end_time", "environment_temporary_access_id", "environment_user_id", "id", "no_access_restrict", "start_time", "updated_at") SELECT "active", "created_at", "day", "end_time", "environment_temporary_access_id", "environment_user_id", "id", "no_access_restrict", "start_time", "updated_at" FROM "environment_user_access_control";
DROP TABLE "environment_user_access_control";
ALTER TABLE "new_environment_user_access_control" RENAME TO "environment_user_access_control";
CREATE UNIQUE INDEX "environment_user_access_control_day_start_time_end_time_environment_user_id_key" ON "environment_user_access_control"("day", "start_time", "end_time", "environment_user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
