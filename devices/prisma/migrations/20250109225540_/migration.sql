-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mobile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_mobile" ("active", "created_at", "id", "updated_at", "user_id", "user_name") SELECT "active", "created_at", "id", "updated_at", "user_id", "user_name" FROM "mobile";
DROP TABLE "mobile";
ALTER TABLE "new_mobile" RENAME TO "mobile";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
