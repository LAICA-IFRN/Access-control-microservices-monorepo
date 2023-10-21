-- CreateTable
CREATE TABLE "microcontroller_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "microcontroller" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environment_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "microcontroller_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "microcontroller_microcontroller_type_id_fkey" FOREIGN KEY ("microcontroller_type_id") REFERENCES "microcontroller_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tag_rfid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mobile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_type_name_key" ON "microcontroller_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_mac_key" ON "microcontroller"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_ip_key" ON "microcontroller"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_mac_ip_key" ON "microcontroller"("mac", "ip");

-- CreateIndex
CREATE UNIQUE INDEX "tag_rfid_tag_key" ON "tag_rfid"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "tag_rfid_user_id_key" ON "tag_rfid"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_rfid_tag_user_id_key" ON "tag_rfid"("tag", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_user_id_key" ON "mobile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_number_key" ON "mobile"("number");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_mac_key" ON "mobile"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_mac_user_id_key" ON "mobile"("mac", "user_id");
