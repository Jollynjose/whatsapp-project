import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../../prisma';

class UserRepository {
  private repository: PrismaClient;

  constructor() {
    this.repository = prisma;
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      const user = await this.repository.user.findUnique({
        where: { phoneNumber },
      });
      return user;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async save(options: Prisma.UserCreateArgs) {
    try {
      return await this.repository.user.create(options);
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const userRepository = new UserRepository();
