import { Prisma } from '@prisma/client';

export type TUser = Prisma.UserGetPayload<{
  include: {
    contact: true;
  };
}>;
