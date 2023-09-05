-- CreateTable
CREATE TABLE "TagRFID" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TagRFID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mobile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mobile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TagRFID_tag_key" ON "TagRFID"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "TagRFID_tag_userId_key" ON "TagRFID"("tag", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_number_key" ON "Mobile"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_mac_key" ON "Mobile"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_mac_userId_key" ON "Mobile"("mac", "userId");
