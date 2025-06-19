/*
  Warnings:

  - You are about to alter the column `addBy` on the `Cheapie` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cheapie" ALTER COLUMN "addBy" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(32);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
