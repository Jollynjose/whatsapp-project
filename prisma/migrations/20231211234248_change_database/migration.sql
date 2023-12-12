/*
  Warnings:

  - The values [SUB] on the enum `BotMenuType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPERADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `case` on the `BotOption` table. All the data in the column will be lost.
  - Added the required column `order` to the `BotOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BotMenuType_new" AS ENUM ('MAIN', 'REMINDER', 'ADMIN');
ALTER TABLE "BotMenu" ALTER COLUMN "type" TYPE "BotMenuType_new" USING ("type"::text::"BotMenuType_new");
ALTER TYPE "BotMenuType" RENAME TO "BotMenuType_old";
ALTER TYPE "BotMenuType_new" RENAME TO "BotMenuType";
DROP TYPE "BotMenuType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "BotOption" DROP COLUMN "case",
ADD COLUMN     "order" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "OptionCaseEnum";
