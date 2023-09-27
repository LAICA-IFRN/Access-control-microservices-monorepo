-- CreateTable
CREATE TABLE "Esp32" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Esp8266" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "esp32Id" INTEGER,
    CONSTRAINT "Esp8266_esp32Id_fkey" FOREIGN KEY ("esp32Id") REFERENCES "Esp32" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Esp32_mac_key" ON "Esp32"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "Esp32_ip_key" ON "Esp32"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Esp32_mac_ip_environmentId_key" ON "Esp32"("mac", "ip", "environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Esp8266_mac_key" ON "Esp8266"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "Esp8266_ip_key" ON "Esp8266"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Esp8266_esp32Id_key" ON "Esp8266"("esp32Id");

-- CreateIndex
CREATE UNIQUE INDEX "Esp8266_mac_ip_environmentId_key" ON "Esp8266"("mac", "ip", "environmentId");
