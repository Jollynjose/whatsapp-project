import dayjs from 'dayjs';
import { dateFormatValidator, dateValidator } from '../helpers/validations';
import { reminderRepository } from './models/domain';
import client from './modules/whatsapp';
import prisma from '../../prisma/index';
import { $Enums } from '@prisma/client';
import { cryptPassword } from '../helpers/encrypt';

function main() {
  // Server.start();
  // cryptPassword('123456').then((pass) => {
  //   prisma.user
  //     .create({
  //       data: {
  //         role: $Enums.UserRole.ADMIN,
  //         contact: {
  //           create: {
  //             fullName: 'Edwin',
  //             phoneNumber: '18298654506',
  //           },
  //         },
  //         password: pass,
  //       },
  //     })
  //     .catch((err) => console.log(err));
  // });

  client.initialize();
}

main();
