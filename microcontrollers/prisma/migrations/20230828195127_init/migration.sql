-- CreateTable
CREATE TABLE "Esp32" (
    "id" SERIAL NOT NULL,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Esp32_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Esp8266" (
    "id" SERIAL NOT NULL,
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "esp32Id" INTEGER NOT NULL,

    CONSTRAINT "Esp8266_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Esp8266_esp32Id_key" ON "Esp8266"("esp32Id");

-- AddForeignKey
ALTER TABLE "Esp8266" ADD CONSTRAINT "Esp8266_esp32Id_fkey" FOREIGN KEY ("esp32Id") REFERENCES "Esp32"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
