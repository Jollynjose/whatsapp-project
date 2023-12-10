import { Client, LocalAuth } from 'whatsapp-web.js';
import qrCode from 'qrcode-terminal';
import bot from '../models/bot';
import { whatsappCronJob } from './cron';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../helpers/regex';

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'client-one' }),
});

client.on('qr', (qr) => {
  qrCode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
  whatsappCronJob(client);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('loading_screen', (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

client.on('message', async (mess) => {
  try {
    await bot.checkSession(mess);
  } catch (error) {
    console.log(error);
  }
});

export default client;
