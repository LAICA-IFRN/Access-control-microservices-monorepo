/*
  Warnings:

  - You are about to drop the column `backup_phrase` on the `environment_microcontroller_config` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_environment_microcontroller_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phrase" TEXT NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_microcontroller_config_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_environment_microcontroller_config" ("environment_id", "id", "phrase") SELECT "environment_id", "id", "phrase" FROM "environment_microcontroller_config";
DROP TABLE "environment_microcontroller_config";
ALTER TABLE "new_environment_microcontroller_config" RENAME TO "environment_microcontroller_config";
CREATE UNIQUE INDEX "environment_microcontroller_config_environment_id_key" ON "environment_microcontroller_config"("environment_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
