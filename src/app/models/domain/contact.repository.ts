import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../../../prisma/index';

class ContactRepository {
  private repository: PrismaClient;
  constructor() {
    this.repository = prisma;
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      const contact = await this.repository.contact.findUnique({
        where: { phoneNumber },
      });

      return contact;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async save(options: Prisma.ContactCreateArgs) {
    try {
      return await this.repository.contact.create(options);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async update(options: Prisma.ContactUpdateArgs) {
    try {
      return await this.repository.contact.update(options);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async findAll() {
    try {
      const contacts = await this.repository.contact.findMany();
      return contacts;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async delete(id: string) {
    try {
      return await this.repository.contact.delete({ where: { id } });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async findOne(id: string) {
    try {
      return await this.repository.contact.findUnique({ where: { id } });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async isExist(phoneNumber: string) {
    try {
      const contact = await this.repository.contact.findUnique({
        where: { phoneNumber },
      });
      return contact !== null;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const contactRepository = new ContactRepository();
