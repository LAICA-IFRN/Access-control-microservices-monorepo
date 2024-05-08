-- CreateTable
CREATE TABLE "environment_microcontroller_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phrase" TEXT NOT NULL,
    "backup_phrase" TEXT DEFAULT 'first',
    "environment_id" TEXT NOT NULL,
    CONSTRAINT "environment_microcontroller_config_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "environment_microcontroller_config_environment_id_key" ON "environment_microcontroller_config"("environment_id");
