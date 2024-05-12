-- CreateTable
CREATE TABLE "microcontroller_cold_start" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "microcontroller_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "microcontroller_cold_start_microcontroller_id_fkey" FOREIGN KEY ("microcontroller_id") REFERENCES "microcontroller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
