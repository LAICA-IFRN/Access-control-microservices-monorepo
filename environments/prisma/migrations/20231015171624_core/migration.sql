-- CreateTable
CREATE TABLE "environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
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
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_manager_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "environment_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start_period" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_period" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
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
    CONSTRAINT "environment_user_access_control_environment_user_id_fkey" FOREIGN KEY ("environment_user_id") REFERENCES "environment_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
