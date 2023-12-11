/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactPhoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactPhoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userPhoneNumber_fkey";

-- DropIndex
DROP INDEX "User_phoneNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
DROP COLUMN "phoneNumber",
ADD COLUMN     "contactPhoneNumber" VARCHAR NOT NULL,
ADD COLUMN     "password" VARCHAR NOT NULL;

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "phoneNumber" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_key" ON "Contact"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_contactPhoneNumber_key" ON "User"("contactPhoneNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_contactPhoneNumber_fkey" FOREIGN KEY ("contactPhoneNumber") REFERENCES "Contact"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userPhoneNumber_fkey" FOREIGN KEY ("userPhoneNumber") REFERENCES "User"("contactPhoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
