-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_access" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" TEXT,
    "environment_id" TEXT,
    "access_by" TEXT,
    "meta" TEXT
);
INSERT INTO "new_access" ("access_by", "created_at", "environment_id", "id", "message", "type", "user_id") SELECT "access_by", "created_at", "environment_id", "id", "message", "type", "user_id" FROM "access";
DROP TABLE "access";
ALTER TABLE "new_access" RENAME TO "access";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
