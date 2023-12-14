import dayjs from 'dayjs';
import prisma from '../../prisma/index';
import config from '../server/config';
import { Client } from 'whatsapp-web.js';
import { ConfigEnum } from '../server/config/config.enum';
import { reminderRepository } from '../app/models/domain';

export const checkOldReminder = async (client: Client) => {
  try {
    const phoneNumber = await client.getNumberId(
      config.get(ConfigEnum.PHONE_NUMBER),
    );
    if (phoneNumber) {
      const reminders = await prisma.reminder.findMany({
        where: {
          date: {
            lte: dayjs().subtract(1, 'day').toDate(),
          },
          isActive: true,
        },
      });

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
  } catch (error) {}
};
