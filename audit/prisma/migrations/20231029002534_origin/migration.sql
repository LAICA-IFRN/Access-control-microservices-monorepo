-- CreateTable
CREATE TABLE "log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" TEXT
);

-- CreateTable
CREATE TABLE "access" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "user_id" TEXT,
    "environment_id" TEXT,
    "message" TEXT NOT NULL,
    "access_by" TEXT NOT NULL
);
