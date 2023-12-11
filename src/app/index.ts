import dayjs from 'dayjs';
import { dateFormatValidator, dateValidator } from '../helpers/validations';
import { reminderRepository } from './models/domain';
import client from './modules/whatsapp';

function main() {
  // Server.start();
  // client.initialize();

  const result = dateFormatValidator.safeParse('02-29-2024');

  console.log(result.success);
}

main();
