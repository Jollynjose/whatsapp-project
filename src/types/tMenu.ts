import { Prisma } from '@prisma/client';

export type MenuWithOptionsAndAnswer = Prisma.BotMenuGetPayload<{
  include: {
    options: {
      include: {
        botAnswer: true;
      };
    };
  };
}>;
