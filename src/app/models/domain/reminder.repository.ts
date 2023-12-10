import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../../prisma';

class ReminderRepository {
  private repository: PrismaClient;
  constructor() {
    this.repository = prisma;
  }

  async findByUserPhoneNumber(userPhoneNumber: string, isActive: boolean) {
    try {
      const reminders = await this.repository.reminder.findMany({
        where: {
          userPhoneNumber,
          isActive,
        },
      });

      return reminders;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async findByPhoneNumberAndDate(date: Date) {
    try {
      const reminders = await this.repository.reminder.findMany({
        where: {
          date: date,
          isActive: true,
        },
      });
      return reminders;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async save(options: Prisma.ReminderCreateArgs) {
    try {
      const reminder = await this.repository.reminder.create(options);

      return reminder;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async update(options: Prisma.ReminderUpdateArgs) {
    try {
      return await this.repository.reminder.update(options);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async updateManyActiveStatus(ids: string[], isActive: boolean) {
    try {
      return await Promise.all(
        ids.map((id) => this.update({ where: { id }, data: { isActive } })),
      );
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const reminderRepository = new ReminderRepository();
