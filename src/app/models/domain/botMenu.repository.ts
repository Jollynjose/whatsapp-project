import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../../prisma/index';

class BotMenuRepository {
  private repository: PrismaClient;

  constructor() {
    this.repository = prisma;
  }

  async findByMenuType(type: Prisma.EnumBotMenuTypeFilter<'BotMenu'>) {
    try {
      const menu = await this.repository.botMenu.findFirst({
        where: {
          type,
        },
        include: {
          options: {
            include: {
              botAnswer: true,
            },
          },
        },
      });
      return menu;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async findAll() {
    try {
      const menus = await this.repository.botMenu.findMany({
        include: {
          options: {
            include: {
              botAnswer: true,
            },
          },
        },
      });

      return menus;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const botMenuRepository = new BotMenuRepository();
