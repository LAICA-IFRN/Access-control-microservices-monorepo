/*
  Warnings:

  - A unique constraint covering the columns `[mac]` on the table `Esp32` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ip]` on the table `Esp32` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mac,ip,environmentId]` on the table `Esp32` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mac]` on the table `Esp8266` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ip]` on the table `Esp8266` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mac,ip,environmentId]` on the table `Esp8266` will be added. If there are existing duplicate values, this will fail.

*/
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
CREATE UNIQUE INDEX "Esp8266_mac_ip_environmentId_key" ON "Esp8266"("mac", "ip", "environmentId");
