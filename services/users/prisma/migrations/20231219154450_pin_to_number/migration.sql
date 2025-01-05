/*
  Warnings:

  - You are about to alter the column `pin` on the `user` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "pin" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "document" TEXT,
    "document_type_id" INTEGER,
    CONSTRAINT "user_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_type" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_user" ("active", "created_at", "created_by", "document", "document_type_id", "email", "id", "name", "password", "pending", "pin", "updated_at") SELECT "active", "created_at", "created_by", "document", "document_type_id", "email", "id", "name", "password", "pending", "pin", "updated_at" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
