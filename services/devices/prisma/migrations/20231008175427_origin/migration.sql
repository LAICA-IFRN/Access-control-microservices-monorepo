-- CreateTable
CREATE TABLE "TagRFID" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mobile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TagRFID_tag_key" ON "TagRFID"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "TagRFID_userId_key" ON "TagRFID"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_userId_key" ON "Mobile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_number_key" ON "Mobile"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Mobile_mac_key" ON "Mobile"("mac");
