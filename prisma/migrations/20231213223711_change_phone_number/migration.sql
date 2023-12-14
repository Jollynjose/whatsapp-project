-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userPhoneNumber_fkey";

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userPhoneNumber_fkey" FOREIGN KEY ("userPhoneNumber") REFERENCES "Contact"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
