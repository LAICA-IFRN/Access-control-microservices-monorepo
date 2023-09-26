/*
  Warnings:

  - You are about to drop the column `contentLength` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `encoded` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "contentLength",
DROP COLUMN "contentType",
DROP COLUMN "fileName",
DROP COLUMN "path",
ADD COLUMN     "encoded" TEXT NOT NULL;
