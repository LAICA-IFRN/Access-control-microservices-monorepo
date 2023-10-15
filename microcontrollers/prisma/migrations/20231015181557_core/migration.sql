-- CreateTable
CREATE TABLE "microcontroller_type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "microcontroller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_mac_key" ON "microcontroller"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_ip_key" ON "microcontroller"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "microcontroller_mac_ip_environmentId_key" ON "microcontroller"("mac", "ip", "environmentId");
