import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../../prisma/index';
import { MenuWithOptionsAndAnswer } from 'src/types/tMenu';

class BotOptionRepository {
  private repository: PrismaClient;

  constructor() {
    this.repository = prisma;
  }

  async save(options: Prisma.BotOptionCreateArgs) {
    try {
      return await this.repository.botOption.create(options);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async createOptionWithOrder(
    options: Prisma.BotOptionCreateArgs,
    menu: MenuWithOptionsAndAnswer,
  ) {
    try {
      let order = 0;
      if (menu.options.length === 0) {
        order = 1;
      } else {
        const highOrder = menu.options.reduce((prev, current) => {
          return prev.order > current.order ? prev : current;
        });

        order = highOrder.order + 1;
      }

      return await this.save({ data: { ...options.data, order } });
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const botOptionRepository = new BotOptionRepository();
