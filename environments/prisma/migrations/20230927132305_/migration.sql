-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EnvAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "startPeriod" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endPeriod" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "environmentId" TEXT NOT NULL,
    CONSTRAINT "EnvAccess_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnvManager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "environmentId" TEXT NOT NULL,
    CONSTRAINT "EnvManager_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Environment_name_key" ON "Environment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EnvAccess_day_startTime_endTime_userId_environmentId_startPeriod_endPeriod_key" ON "EnvAccess"("day", "startTime", "endTime", "userId", "environmentId", "startPeriod", "endPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "EnvManager_userId_environmentId_key" ON "EnvManager"("userId", "environmentId");
