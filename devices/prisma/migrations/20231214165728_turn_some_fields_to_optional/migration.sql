-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mobile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "number" TEXT,
    "mac" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_mobile" ("active", "created_at", "id", "mac", "number", "updated_at", "user_id") SELECT "active", "created_at", "id", "mac", "number", "updated_at", "user_id" FROM "mobile";
DROP TABLE "mobile";
ALTER TABLE "new_mobile" RENAME TO "mobile";
CREATE UNIQUE INDEX "mobile_user_id_key" ON "mobile"("user_id");
CREATE UNIQUE INDEX "mobile_number_key" ON "mobile"("number");
CREATE UNIQUE INDEX "mobile_mac_key" ON "mobile"("mac");
CREATE UNIQUE INDEX "mobile_mac_user_id_key" ON "mobile"("mac", "user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
