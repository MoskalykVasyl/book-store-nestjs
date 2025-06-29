/*
  Warnings:

  - You are about to drop the column `is_two_factor_enabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_two_factor_enabled",
DROP COLUMN "is_verified",
DROP COLUMN "method";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "tokens";

-- DropEnum
DROP TYPE "AuthMethod";

-- DropEnum
DROP TYPE "TokenType";
