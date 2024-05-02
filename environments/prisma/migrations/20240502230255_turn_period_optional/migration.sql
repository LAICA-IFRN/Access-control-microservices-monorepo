-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_environment_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permanent_access" BOOLEAN NOT NULL DEFAULT false,
    "start_period" DATETIME,
    "end_period" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_user_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_environment_user" ("active", "created_at", "created_by", "end_period", "environment_id", "id", "permanent_access", "start_period", "updated_at", "user_id", "user_name") SELECT "active", "created_at", "created_by", "end_period", "environment_id", "id", "permanent_access", "start_period", "updated_at", "user_id", "user_name" FROM "environment_user";
DROP TABLE "environment_user";
ALTER TABLE "new_environment_user" RENAME TO "environment_user";
CREATE UNIQUE INDEX "environment_user_user_id_environment_id_key" ON "environment_user"("user_id", "environment_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
