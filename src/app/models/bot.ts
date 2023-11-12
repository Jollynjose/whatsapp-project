import { Chat, Contact, Message } from 'whatsapp-web.js';
import { Session, SessionObserver } from './session';
import userRepository from './domain/user.repository';

class Bot {
  private sessionObserver: SessionObserver;
  constructor() {
    this.sessionObserver = new SessionObserver();
  }

  private async greeting(chat: Chat) {
    try {
      await chat.sendMessage(
        'Hola, Hablas con El Asistente de Jollyn \nen que te puedo ayudar?',
      );
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async addSession(chat: Chat) {
    try {
      const contact = await chat.getContact();
      const name = contact.name ?? contact.pushname;
      this.greeting(chat);
      this.sessionObserver.addSession(new Session({ chat, contactName: name }));

      return await this.checkUserExist(chat, name);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async isUserExist(id: string): Promise<boolean> {
    const user = await userRepository.findByPhoneNumber(id);
    return user !== null;
  }

  private async checkUserExist(chat: Chat, contactName: string) {
    try {
      const isUser = await this.isUserExist(chat.id.user);

      if (!isUser) {
        const newUser = { phoneNumber: chat.id.user, fullName: contactName };
        return await userRepository.save({
          data: newUser,
        });
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async checkSession(mess: Message) {
    try {
      const chat = await mess.getChat();
      if (chat.isGroup) return;

      if (!this.sessionObserver.isSessionExist(chat.id.user)) {
        return await this.addSession(chat);
      }

      await this.sendMessage(chat, mess);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async sendMessage(chat: Chat, mess: Message) {
    try {
      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (!session) return;

      session.sendMessage('Te quiero mucho');

      this.sessionObserver.updateLastActivityTime({
        lastTimeActive: mess.timestamp,
        session,
      });
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export default new Bot();
