import { Client, LocalAuth } from 'whatsapp-web.js';
import qrCode from 'qrcode-terminal';

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

client.on('message', (mess) => {
  client.sendMessage(mess.from, `Hola ${mess.from}, como estas?`);
});

export default client;
