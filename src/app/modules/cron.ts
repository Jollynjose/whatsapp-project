import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { Client } from 'whatsapp-web.js';
import { reminderRepository } from '../models/domain/reminder.repository';
import config from '../../server/config';
import { ConfigEnum } from '../../server/config/config.enum';

// EVERY SECOND CRON JOB(* * * * * *)
// EVERY MINUTE CRON JOB(0 1 * * * *)
// EVERY HOUR CRON JOB(0 0 1 * * *)
// EVERY DAY CRON JOB(0 0 0 1 * *)
// EVERY DAY AT 7:30 AM CRON JOB(30 7 * * *)

const cronJob = CronJob.from({
  cronTime: '0 * * * *',
  onTick: () => {},
  start: false,
  timeZone: 'system',
});

export const whatsappCronJob = (client: Client) => {
  cronJob.start();
  cronJob.addCallback(async () => {
    try {
      const date = dayjs().toDate();
      date.setMinutes(0, 0, 0);
      const phoneNumber = await client.getNumberId(
        config.get(ConfigEnum.PHONE_NUMBER),
      );
      if (phoneNumber) {
        const reminders =
          await reminderRepository.findByPhoneNumberAndDate(date);

        let isError = false;
        reminders.forEach(async (reminder) => {
          try {
            const message = `Tienes un mensaje de ${reminder.userPhoneNumber} que dice:\n${reminder.body}`;
            await client.sendMessage(phoneNumber._serialized, message);
          } catch (error) {
            console.log(error);
            isError = true;
          }
        });

        if (!isError) {
          await reminderRepository.updateManyActiveStatus(
            reminders.map((reminder) => reminder.id),
            false,
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};
