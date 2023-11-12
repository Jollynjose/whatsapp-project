-- CreateEnum
CREATE TYPE "OptionCaseEnum" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH');

-- CreateEnum
CREATE TYPE "BotChatGPTPersonality" AS ENUM ('SALESPERSON', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "BotMenuType" AS ENUM ('MAIN', 'SUB', 'REMINDER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "phoneNumber" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userPhoneNumber" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotAnswer" (
    "id" UUID NOT NULL,
    "optionId" UUID NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "BotAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotOption" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "case" "OptionCaseEnum" NOT NULL,
    "botMenuId" UUID NOT NULL,

    CONSTRAINT "BotOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotChatGPT" (
    "id" UUID NOT NULL,
    "personality" "BotChatGPTPersonality" NOT NULL,

    CONSTRAINT "BotChatGPT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotMenu" (
    "id" UUID NOT NULL,
    "type" "BotMenuType" NOT NULL,

    CONSTRAINT "BotMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotChatGPTPrompt" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "botChatGPTId" UUID NOT NULL,

    CONSTRAINT "BotChatGPTPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BotAnswer_optionId_key" ON "BotAnswer"("optionId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userPhoneNumber_fkey" FOREIGN KEY ("userPhoneNumber") REFERENCES "User"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAnswer" ADD CONSTRAINT "BotAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "BotOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotOption" ADD CONSTRAINT "BotOption_botMenuId_fkey" FOREIGN KEY ("botMenuId") REFERENCES "BotMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotChatGPTPrompt" ADD CONSTRAINT "BotChatGPTPrompt_botChatGPTId_fkey" FOREIGN KEY ("botChatGPTId") REFERENCES "BotChatGPT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
