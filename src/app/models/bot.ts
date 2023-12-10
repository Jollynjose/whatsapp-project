import { Chat, Message as MessageWs } from 'whatsapp-web.js';
import { Session, SessionObserver } from './session';
import {
  userRepository,
  botMenuRepository,
  reminderRepository,
} from './domain';
import { $Enums } from '@prisma/client';
import { Message } from './message';
import { MenuWithOptionsAndAnswer } from 'src/types/tMenu';
import client from '../modules/whatsapp';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../helpers/regex';

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
        session.addMessage(new Message(message, '', 'MAIN'));
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

  private reminderResponses() {}

  private async sendMessage(chat: Chat, mess: MessageWs) {
    try {
      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (!session) return;

      const message = session.getLastMessage();

      const menu = this.menus.find(
        (menu) => menu.type === message.getMenuType(),
      );

      if (menu) {
        const option = menu.options.find(
          (option) =>
            option.case.toString() ===
            OPTIONS[mess.body as keyof typeof OPTIONS],
        );
        if (menu.type === 'REMINDER') {
          const lastMessage = session.getLastMessage();
          if (lastMessage) {
            const isFirstOption = menu.options.some(
              (option) =>
                option.text === lastMessage.getMessage().body &&
                option.case === $Enums.OptionCaseEnum.FIRST,
            );
            const isSecondOption = menu.options.some(
              (option) =>
                option.text === lastMessage.getMessage().body &&
                option.case === $Enums.OptionCaseEnum.SECOND,
            );
            if (isFirstOption) {
              const secondOption = menu.options.find(
                (option) => option.case === $Enums.OptionCaseEnum.SECOND,
              );
              if (secondOption) {
                const message = await chat.sendMessage(secondOption.text);
                session.addMessage(new Message(message, mess.body, menu.type));
              }
            }
            if (isSecondOption) {
              const isCorrectFormat = DATE_FORMAT.test(mess.body);
              const isDateValid = dayjs(
                mess.body,
                'MM-DD-YYYY',
                true,
              ).isValid();
              console.log(isCorrectFormat, isDateValid, mess.body);
              if (isCorrectFormat && isDateValid) {
                const message = await chat.sendMessage(
                  'Fecha correcta guardado',
                );
                const reminder = await reminderRepository.save({
                  data: {
                    date: dayjs(mess.body).toDate(),
                    userPhoneNumber: chat.id.user,
                    isActive: true,
                    body: lastMessage.getBody(),
                  },
                });
                console.log(reminder);
                const menu = this.menus.find((menu) => menu.type === 'MAIN');
                if (menu) {
                  const response = this.createMenuMessage(menu);
                  await chat.sendMessage(
                    `Selecciona del 1 al ${menu.options.length}\n${response}`,
                  );
                }
                session.addMessage(new Message(message, mess.body, 'MAIN'));
              } else {
                await chat.sendMessage('Fecha incorrecta');
                session.addMessage(
                  new Message(
                    lastMessage.getMessage(),
                    lastMessage.getBody(),
                    menu.type,
                  ),
                );
              }
            }
          }
        } else if (option) {
          if (menu.type === 'MAIN') {
            const answer = option.botAnswer;
            const isReminder = mess.body === '4';

            if (isReminder) {
              const reminderMenu = this.menus.find(
                (_menu) => _menu.type === 'REMINDER',
              );
              if (reminderMenu) {
                const message = await chat.sendMessage(
                  reminderMenu.options.find(
                    (option) => option.case === $Enums.OptionCaseEnum.FIRST,
                  )?.text ?? '',
                );
                session.addMessage(
                  new Message(message, mess.body, reminderMenu.type),
                );
              }
            } else {
              const response = this.createMenuMessage(menu);
              const message = await chat.sendMessage(answer?.text ?? '');
              if (mess.body !== '3') {
                await chat.sendMessage(
                  `Selecciona del 1 al ${menu.options.length}\n${response}`,
                );
              }

              session.addMessage(new Message(message, mess.body, menu.type));
            }
          }
        } else {
          const lastMessage = session.getLastMessage();

          if (
            lastMessage &&
            lastMessage.getMenuType() === 'MAIN' &&
            lastMessage.getBody() === '3'
          ) {
            const phoneNumber = await client.getNumberId('8293360821');
            let message: MessageWs;
            if (phoneNumber) {
              message = await client.sendMessage(
                phoneNumber._serialized,
                mess.body,
              );
            } else {
              message = await chat.sendMessage('Numero no registrado');
            }

            const response = this.createMenuMessage(menu);
            await chat.sendMessage(
              `Selecciona del 1 al ${menu.options.length}\n${response}`,
            );

            await chat.sendMessage('Mensaje enviado');
            session.addMessage(new Message(message, mess.body, menu.type));
          } else {
            const response = this.createMenuMessage(menu);
            const message = await chat.sendMessage(
              'Por favor, seleccione un opcion correcta',
            );
            await chat.sendMessage(
              `Selecciona del 1 al ${menu.options.length}\n${response}`,
            );
            session.addMessage(new Message(message, mess.body, menu.type));
          }
        }
      }

      this.sessionObserver.updateLastActivityTime({
        lastTimeActive: mess.timestamp,
        session,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new Bot();
