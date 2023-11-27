import { Chat, Message as MessageWs } from 'whatsapp-web.js';
import { Session, SessionObserver } from './session';
import { userRepository, botMenuRepository } from './domain';
import { $Enums } from '@prisma/client';
import { Message } from './message';
import { MenuWithOptionsAndAnswer } from 'src/types/tMenu';
import client from '../modules/whatsapp';

const OPTIONS = {
  '1': 'FIRST',
  '2': 'SECOND',
  '3': 'THIRD',
  '4': 'FOURTH',
  '5': 'FIFTH',
};

class Bot {
  private sessionObserver: SessionObserver;
  private menus: MenuWithOptionsAndAnswer[];
  constructor() {
    this.sessionObserver = new SessionObserver();
    this.menus = [];
    this.loadMenus().catch((error) => console.log(error));
  }

  private async loadMenus() {
    try {
      const menus = await botMenuRepository.findAll();
      this.menus = menus;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private createMenuMessage(menu: MenuWithOptionsAndAnswer) {
    let response = '';
    menu.options.forEach((option, index) => {
      response += `${index + 1} - ${option.text}\n`;
    });

    return response;
  }

  private async loadMenu(type: $Enums.BotMenuType) {
    try {
      const menu = this.menus.find((menu) => menu.type === type);

      if (menu) {
        return {
          menuLength: menu?.options.length,
          response: this.createMenuMessage(menu),
          menuId: menu?.id,
        };
      }

      return {
        menuLength: 0,
        response: '',
        menuId: '',
      };
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async greeting(chat: Chat) {
    try {
      await chat.sendMessage(
        'Hola, hablas con el asistente de Jollyn \nEn que te puedo ayudar?\n',
      );

      const { response, menuLength } = await this.loadMenu('MAIN');
      const message = await chat.sendMessage(
        `Selecciona del 1 al ${menuLength}\n${response}`,
      );

      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (session) {
        session.addMessage(new Message('MAIN', message));
      }
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

  async checkSession(mess: MessageWs) {
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

  private async sendMessage(chat: Chat, mess: MessageWs) {
    try {
      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (!session) return;

      const message = session.getLastMessage();

      const menu = this.menus.find((menu) => menu.type === message.getId());
      if (menu) {
        const option = menu.options.find(
          (option) =>
            option.case.toString() ===
            OPTIONS[mess.body as keyof typeof OPTIONS],
        );
        if (option) {
          if (menu.type === 'REMINDER') {
          } else if (menu.type === 'MAIN') {
            const answer = option.botAnswer;
            const isReminder = mess.body === '4';

            if (isReminder) {
              const reminderMenu = this.menus.find(
                (_menu) => _menu.type === 'REMINDER',
              );

              if (reminderMenu) {
                const response = this.createMenuMessage(reminderMenu);
                const message = await chat.sendMessage(
                  `Selecciona del 1 al ${reminderMenu.options.length}\n${response}`,
                );
                session.addMessage(new Message('REMINDER', message));
              }
            } else {
              const response = this.createMenuMessage(menu);
              await chat.sendMessage(answer?.text ?? '');
              if (mess.body !== '3') {
                await chat.sendMessage(
                  `Selecciona del 1 al ${menu.options.length}\n${response}`,
                );
              }

              session.addMessage(new Message('MAIN', mess));
            }
          }
        } else {
          const lastMenu = session.getLastMessage();
          if (
            lastMenu &&
            lastMenu.getId() === 'MAIN' &&
            lastMenu.getMessage().body === '3'
          ) {
            const phoneNumber = await client.getNumberId('8098465117');
            if (phoneNumber) {
              await client.sendMessage(phoneNumber._serialized, mess.body);
              await chat.sendMessage('Mensaje enviado');
            } else {
              await chat.sendMessage('Numero no registrado');
            }
            const response = this.createMenuMessage(menu);
            await chat.sendMessage(
              `Selecciona del 1 al ${menu.options.length}\n${response}`,
            );
          } else {
            const response = this.createMenuMessage(menu);
            await chat.sendMessage('Por favor, seleccione un opcion correcta');
            await chat.sendMessage(
              `Selecciona del 1 al ${menu.options.length}\n${response}`,
            );
          }
          session.addMessage(new Message('MAIN', mess));
        }
        // if (option) {
        //   const answer = option.botAnswer;
        //   const isReminder = mess.body === '4';
        //   if (answer && !isReminder) {
        //     await chat.sendMessage(answer.text);
        //   }

        //   if (menu.type === 'MAIN' && !isReminder) {
        //     const response = this.createMenuMessage(menu);

        //     const message = await chat.sendMessage(
        //       `Selecciona del 1 al ${menu.options.length}\n${response}`,
        //     );

        //     session.addMessage(new Message(menu.type, message));
        //   } else {
        //     const reminderMenu = this.menus.find(
        //       (_menu) => _menu.type === 'REMINDER',
        //     );
        //     if (reminderMenu) {
        //       const response = this.createMenuMessage(reminderMenu);
        //       const message = await chat.sendMessage(
        //         `Selecciona del 1 al ${reminderMenu.options.length}\n${response}`,
        //       );
        //       session.addMessage(new Message('REMINDER', message));
        //     }
        //   }
        // }
      }

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
