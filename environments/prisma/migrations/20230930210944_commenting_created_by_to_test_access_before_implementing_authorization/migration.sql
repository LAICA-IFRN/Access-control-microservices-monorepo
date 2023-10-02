/*
  Warnings:

  - You are about to drop the column `createdBy` on the `EnvAccess` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `EnvManager` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Environment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EnvAccess" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "EnvManager" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "Environment" DROP COLUMN "createdBy";
