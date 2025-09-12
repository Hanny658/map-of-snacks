/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Place_identifier_key" ON "Place"("identifier");
