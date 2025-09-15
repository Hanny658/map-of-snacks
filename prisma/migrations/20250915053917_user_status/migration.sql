-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'contributor', 'banned');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" DEFAULT 'active';
