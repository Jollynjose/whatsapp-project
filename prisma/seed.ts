import { Prisma } from '@prisma/client';
import prisma from './index';

async function main() {
  try {
    const repository = prisma;

    const data: Prisma.BotMenuCreateInput[] = [
      {
        type: 'MAIN',
        options: {
          create: [
            {
              text: 'Informacion Personal',
              case: 'FIRST',
              botAnswer: {
                create: {
                  text: 'Soy un software enginner, me gusta programar y crear cosas nuevas.\n Brindo servicios de desarrollo de software, diseño de paginas web, aplicaciones moviles y mucho mas.',
                },
              },
            },
            {
              text: 'Horas de servicio',
              case: 'SECOND',
              botAnswer: {
                create: {
                  text: 'Trabajo de lunes a viernes de 8:00 am a 5:00 pm',
                },
              },
            },
            {
              text: 'Quieres decirle algo a Jollyn?',
              case: 'THIRD',
              botAnswer: {
                create: {
                  text: 'Inserte su mensaje aqui',
                },
              },
            },
            {
              text: 'Quieres crear un Recordatorio?',
              case: 'FOURTH',
              botAnswer: {
                create: {
                  text: 'Inserte su mensaje aqui',
                },
              },
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
              case: 'FIRST',
            },
            {
              text: 'Inserte la fecha en que se recordara la fecha, con el siguiente formato: 2021-10-10(YYYY-MM-DD)',
              case: 'SECOND',
              botAnswer: {
                create: {
                  text: 'Formato invalido, por favor ingrese la fecha con el siguiente formato: 2021-10-10(YYYY-MM-DD)',
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
  } catch (err) {
    console.log(err);
  }
}

main().catch((e) => console.error(e));
