import { Client, LocalAuth } from 'whatsapp-web.js';
import qrCode from 'qrcode-terminal';
import bot from '../models/bot';

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'client-one' }),
});

client.on('qr', (qr) => {
  qrCode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
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
