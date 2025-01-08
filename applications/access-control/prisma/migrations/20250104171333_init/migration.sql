-- CreateTable
CREATE TABLE "environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "user_name" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "environment_restriction_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_restriction_access_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "environment_manager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_manager_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "environment_user" (
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

-- CreateTable
CREATE TABLE "environment_user_access_control" (
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

-- CreateTable
CREATE TABLE "environment_temporary_access" (
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
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "microcontroller_type_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "microcontroller_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "microcontroller_microcontroller_type_id_fkey" FOREIGN KEY ("microcontroller_type_id") REFERENCES "microcontroller_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "microcontroller_cold_start" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "microcontroller_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "microcontroller_cold_start_microcontroller_id_fkey" FOREIGN KEY ("microcontroller_id") REFERENCES "microcontroller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "environment_name_key" ON "environment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "environment_restriction_access_day_start_time_end_time_environment_id_key" ON "environment_restriction_access"("day", "start_time", "end_time", "environment_id");

-- CreateIndex
CREATE UNIQUE INDEX "environment_manager_user_id_environment_id_key" ON "environment_manager"("user_id", "environment_id");

-- CreateIndex
CREATE UNIQUE INDEX "environment_user_user_id_environment_id_key" ON "environment_user"("user_id", "environment_id");

-- CreateIndex
CREATE UNIQUE INDEX "environment_user_access_control_day_start_time_end_time_environment_user_id_key" ON "environment_user_access_control"("day", "start_time", "end_time", "environment_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "environment_temporary_access_user_id_environment_id_key" ON "environment_temporary_access"("user_id", "environment_id");

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
