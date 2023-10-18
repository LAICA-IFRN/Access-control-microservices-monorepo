-- AlterTable
ALTER TABLE "user_role" ADD COLUMN "created_by" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "document" TEXT NOT NULL,
    "document_type_id" INTEGER NOT NULL,
    CONSTRAINT "user_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user" ("active", "created_at", "created_by", "document", "document_type_id", "email", "id", "name", "password", "updated_at") SELECT "active", "created_at", "created_by", "document", "document_type_id", "email", "id", "name", "password", "updated_at" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
