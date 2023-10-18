import { Client, LocalAuth } from 'whatsapp-web.js';
import qrCode from 'qrcode-terminal';
import { Session, sessionObserver } from '../../app/models/session';

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
    const chat = await mess.getChat();
    if (chat.isGroup) return;

    if (!sessionObserver.isSessionExist(chat.id.user)) {
      const contact = await mess.getContact();
      const name = contact.name ?? contact.pushname;
      sessionObserver.addSession(new Session({ chat, contactName: name }));
      return;
    }

    sessionObserver.updateLastActivityTime(chat.id.user, mess.timestamp);
  } catch (error) {
    console.log(error);
  }
});

export default client;
