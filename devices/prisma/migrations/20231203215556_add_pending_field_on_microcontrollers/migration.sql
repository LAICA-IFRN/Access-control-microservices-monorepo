-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_microcontroller" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environment_id" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "microcontroller_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "microcontroller_microcontroller_type_id_fkey" FOREIGN KEY ("microcontroller_type_id") REFERENCES "microcontroller_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_microcontroller" ("active", "created_at", "environment_id", "id", "ip", "mac", "microcontroller_type_id", "updated_at") SELECT "active", "created_at", "environment_id", "id", "ip", "mac", "microcontroller_type_id", "updated_at" FROM "microcontroller";
DROP TABLE "microcontroller";
ALTER TABLE "new_microcontroller" RENAME TO "microcontroller";
CREATE UNIQUE INDEX "microcontroller_mac_key" ON "microcontroller"("mac");
CREATE UNIQUE INDEX "microcontroller_ip_key" ON "microcontroller"("ip");
CREATE UNIQUE INDEX "microcontroller_mac_ip_key" ON "microcontroller"("mac", "ip");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
