import { Prisma, $Enums } from '@prisma/client';
import { cryptPassword } from '../src/helpers/encrypt';
import Config from '../src/server/config';
import { ConfigEnum } from '../src/server/config/config.enum';
import prisma from './index';

async function main() {
  try {
    const repository = prisma;

    const password = Config.get(ConfigEnum.PASSWORD);

    const passwordCrypted = await cryptPassword(password);

    // Create Admin user
    await prisma.user.create({
      data: {
        password: passwordCrypted,
        contact: {
          create: {
            phoneNumber: Config.get(ConfigEnum.PHONE_NUMBER),
            fullName: 'Admin',
          },
        },
        role: $Enums.UserRole.ADMIN,
      },
    });

    const data: Prisma.BotMenuCreateInput[] = [
      {
        type: 'MAIN',
      },
      {
        type: 'ADMIN',
        options: {
          create: [
            {
              text: 'Te gustaria agregar una nueva opcion?',
              order: 1,
              botAnswer: {
                create: {
                  text: 'Inserte la nueva opcion',
                },
              },
            },
            {
              text: 'Te gustaria pasar a la seccion de menus?',
              order: 2,
            },
          ],
        },
      },
      {
        type: 'REMINDER',
        options: {
          create: [
            {
              text: 'Inserte su mensaje aqui',
              order: 1,
            },
            {
              text: 'Inserte la fecha en que se recordara la fecha, con el siguiente formato: 2021-10-10(YYYY-MM-DD)',
              order: 2,
              botAnswer: {
                create: {
                  text: 'Formato invalido, por favor ingrese la fecha con el siguiente formato: 2021-10-10(YYYY-MM-DD)',
                },
              },
            },
            {
              text: 'Inserte la hora en que se recordara la fecha, solo se acepta que la hora sea en punto, con el siguiente formato: 10:00(HH:MM) AM/PM(por defecto es AM)',
              order: 3,
              botAnswer: {
                create: {
                  text: 'Formato invalido, por favor ingrese la hora con el siguiente formato: 10:00(HH:MM) AM/PM(por defecto es AM)',
                },
              },
            },
          ],
        },
      },
    ];

    for (const element of data) {
      await repository.botMenu.create({
        data: element,
      });
    }

    console.log('Seed completed');
  } catch (err) {
    console.log(err);
  }
}

main().catch((e) => console.error(e));
