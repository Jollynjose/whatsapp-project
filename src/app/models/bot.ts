import { Chat, Message as MessageWs } from 'whatsapp-web.js';
import { Session, SessionObserver } from './session';
import {
  userRepository,
  botMenuRepository,
  reminderRepository,
} from './domain';
import { $Enums } from '@prisma/client';
import { Message } from './message';
import { MenuWithOptionsAndAnswer } from '../../types/tMenu';
import client from '../modules/whatsapp';
import dayjs from 'dayjs';
import { contactRepository } from './domain/contact.repository';
import { IResponse } from '../../types/IResponse';
import { botOptionRepository } from './domain/botOption.repository';
import {
  dateFormatValidator,
  dateValidator,
  hourValidator,
} from '../../helpers/validations';

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
    menu.options.forEach((option) => {
      response += `${option.order} - ${option.text}\n`;
    });

    if (menu.type === 'MAIN') {
      response += `${menu.options.length + 1} - Quieres hacer un recordatorio?`;
    }

    return response;
  }

  private async loadMenu(menu: MenuWithOptionsAndAnswer) {
    return {
      menuLength: menu.options.length,
      response: this.createMenuMessage(menu),
      menuId: menu?.id,
    };
  }

  private async greeting(chat: Chat, isAdmin: boolean) {
    try {
      const customMessage = `Hola, ${
        isAdmin ? 'Admin' : 'hablas con el asistente de Jollyn'
      }\nEn que te puedo ayudar?\n}`;
      await chat.sendMessage(customMessage);

      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (session) {
        const menu = session.getMenuHelper().getCurrentMenu();
        const { response, menuLength } = await this.loadMenu(menu);

        const message = await chat.sendMessage(
          `Selecciona del 1 al ${menuLength}\n${response}`,
        );

        session.addMessage(
          new Message(message, '', isAdmin ? 'ADMIN' : 'MAIN'),
        );
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async addSession(chat: Chat) {
    try {
      const contact = await chat.getContact();
      const name = contact.name ?? contact.pushname;

      const isAdmin =
        (await userRepository.findByPhoneNumber(chat.id.user)) !== null;

      this.sessionObserver.addSession(
        new Session({ chat, contactName: name, isAdmin, menus: this.menus }),
      );
      this.greeting(chat, isAdmin);

      return await this.checkUserExist(chat, name);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async isContactExist(phoneNumber: string): Promise<boolean> {
    const contact = await contactRepository.findByPhoneNumber(phoneNumber);
    return contact !== null;
  }

  private async checkUserExist(chat: Chat, contactName: string) {
    try {
      const isContact = await this.isContactExist(chat.id.user);

      if (!isContact) {
        const newContact = { phoneNumber: chat.id.user, fullName: contactName };
        return await contactRepository.save({ data: newContact });
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

  // const menu = this.menus.find(
  //   (menu) => menu.type === message.getMenuType(),
  // );

  // if (menu) {
  //   const option = menu.options.find(
  //     (option) =>
  //       option.case.toString() ===
  //       OPTIONS[mess.body as keyof typeof OPTIONS],
  //   );
  //   if (menu.type === 'REMINDER') {
  //     const lastMessage = session.getLastMessage();
  //     if (lastMessage) {
  //       const isFirstOption = menu.options.some(
  //         (option) =>
  //           option.text === lastMessage.getMessage().body &&
  //           option.case === $Enums.OptionCaseEnum.FIRST,
  //       );
  //       const isSecondOption = menu.options.some(
  //         (option) =>
  //           option.text === lastMessage.getMessage().body &&
  //           option.case === $Enums.OptionCaseEnum.SECOND,
  //       );
  //       if (isFirstOption) {
  //         const secondOption = menu.options.find(
  //           (option) => option.case === $Enums.OptionCaseEnum.SECOND,
  //         );
  //         if (secondOption) {
  //           const message = await chat.sendMessage(secondOption.text);
  //           session.addMessage(new Message(message, mess.body, menu.type));
  //         }
  //       }
  //       if (isSecondOption) {
  //         const isCorrectFormat = DATE_FORMAT.test(mess.body);
  //         const isDateValid = dayjs(
  //           mess.body,
  //           'MM-DD-YYYY',
  //           true,
  //         ).isValid();
  //         console.log(isCorrectFormat, isDateValid, mess.body);
  //         if (isCorrectFormat && isDateValid) {
  //           const message = await chat.sendMessage(
  //             'Fecha correcta guardado',
  //           );
  //           const reminder = await reminderRepository.save({
  //             data: {
  //               date: dayjs(mess.body).toDate(),
  //               userPhoneNumber: chat.id.user,
  //               isActive: true,
  //               body: lastMessage.getBody(),
  //             },
  //           });
  //           console.log(reminder);
  //           const menu = this.menus.find((menu) => menu.type === 'MAIN');
  //           if (menu) {
  //             const response = this.createMenuMessage(menu);
  //             await chat.sendMessage(
  //               `Selecciona del 1 al ${menu.options.length}\n${response}`,
  //             );
  //           }
  //           session.addMessage(new Message(message, mess.body, 'MAIN'));
  //         } else {
  //           await chat.sendMessage('Fecha incorrecta');
  //           session.addMessage(
  //             new Message(
  //               lastMessage.getMessage(),
  //               lastMessage.getBody(),
  //               menu.type,
  //             ),
  //           );
  //         }
  //       }
  //     }
  //   } else if (option) {
  //     if (menu.type === 'MAIN') {
  //       const answer = option.botAnswer;
  //       const isReminder = mess.body === '4';

  //       if (isReminder) {
  //         const reminderMenu = this.menus.find(
  //           (_menu) => _menu.type === 'REMINDER',
  //         );
  //         if (reminderMenu) {
  //           const message = await chat.sendMessage(
  //             reminderMenu.options.find(
  //               (option) => option.case === $Enums.OptionCaseEnum.FIRST,
  //             )?.text ?? '',
  //           );
  //           session.addMessage(
  //             new Message(message, mess.body, reminderMenu.type),
  //           );
  //         }
  //       } else {
  //         const response = this.createMenuMessage(menu);
  //         const message = await chat.sendMessage(answer?.text ?? '');
  //         if (mess.body !== '3') {
  //           await chat.sendMessage(
  //             `Selecciona del 1 al ${menu.options.length}\n${response}`,
  //           );
  //         }

  //         session.addMessage(new Message(message, mess.body, menu.type));
  //       }
  //     }
  //   } else {
  //     const lastMessage = session.getLastMessage();

  //     if (
  //       lastMessage &&
  //       lastMessage.getMenuType() === 'MAIN' &&
  //       lastMessage.getBody() === '3'
  //     ) {
  //       const phoneNumber = await client.getNumberId('8293360821');
  //       let message: MessageWs;
  //       if (phoneNumber) {
  //         message = await client.sendMessage(
  //           phoneNumber._serialized,
  //           mess.body,
  //         );
  //       } else {
  //         message = await chat.sendMessage('Numero no registrado');
  //       }

  //       const response = this.createMenuMessage(menu);
  //       await chat.sendMessage(
  //         `Selecciona del 1 al ${menu.options.length}\n${response}`,
  //       );

  //       await chat.sendMessage('Mensaje enviado');
  //       session.addMessage(new Message(message, mess.body, menu.type));
  //     } else {
  //       const response = this.createMenuMessage(menu);
  //       const message = await chat.sendMessage(
  //         'Por favor, seleccione un opcion correcta',
  //       );
  //       await chat.sendMessage(
  //         `Selecciona del 1 al ${menu.options.length}\n${response}`,
  //       );
  //       session.addMessage(new Message(message, mess.body, menu.type));
  //     }
  //   }
  // }

  private async updateMenus() {
    try {
      await this.loadMenus();
      this.sessionObserver.updateMenus(this.menus);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async reminderResponse({
    mess,
    menuHelper,
    session,
    chat,
  }: IResponse) {
    try {
      const option = menuHelper.getOption();

      if (option) {
        switch (option.order) {
          case 1:
            session.setPayload({
              reminder: {
                text: mess.body,
                date: dayjs(),
              },
            });
            const optionToSend = menuHelper.getOptionByOrder(2);
            const message = await chat.sendMessage(optionToSend?.text ?? '');

            session.addMessage(new Message(message, mess.body, 'ADMIN'));
            break;
          case 2:
            const isFormatValid = dateFormatValidator.safeParse(mess.body);
            const isDateValid = dateValidator.safeParse(mess.body);
            if (isFormatValid.success && isDateValid.success) {
              const payload = session.getPayload();
              if (payload.reminder) {
                session.setPayload({
                  reminder: {
                    ...payload.reminder,
                    date: dayjs(mess.body),
                  },
                });
                const optionToSend = menuHelper.getOptionByOrder(3);
                await chat.sendMessage('Fecha correcta');
                const message = await chat.sendMessage(
                  optionToSend?.text ?? '',
                );
                session.addMessage(new Message(message, mess.body, 'REMINDER'));
              }
            } else {
              const message = await chat.sendMessage(
                option.botAnswer?.text ?? 'Fecha invalida',
              );
              session.addMessage(new Message(message, mess.body, 'REMINDER'));
            }
            break;
          case 3:
            const isHourValid = hourValidator.safeParse(mess.body);

            if (isHourValid.success) {
              const payload = session.getPayload();

              if (payload.reminder) {
                const splitPeriods = mess.body.split(' ');
                const splitTime = splitPeriods[0].split(':');
                let time = 0;
                if (splitPeriods[1].toLowerCase() === 'pm') {
                  time = parseInt(splitTime[0]) + 12;
                } else {
                  time = parseInt(splitTime[0]);
                }

                const date = payload.reminder.date.set('hour', time).toDate();

                await reminderRepository.save({
                  data: {
                    date,
                    userPhoneNumber: chat.id.user,
                    isActive: true,
                    body: payload.reminder.text,
                  },
                });
                const message = await chat.sendMessage('Recordatorio guardado');
                menuHelper.setCurrentMenu('MAIN');

                const menu = menuHelper.getCurrentMenu();
                const { response, menuLength } = await this.loadMenu(menu);
                await chat.sendMessage(
                  `Selecciona del 1 al ${menuLength}\n${response}`,
                );
                session.addMessage(new Message(message, mess.body, 'REMINDER'));
              }
            } else {
              const message = await chat.sendMessage(
                option.botAnswer?.text ?? 'Hora invalida',
              );
              session.addMessage(new Message(message, mess.body, 'REMINDER'));
            }

            break;
          default:
            chat.sendMessage('Opcion invalida');
        }
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async adminResponse({ mess, menuHelper, session, chat }: IResponse) {
    try {
      const currentAction = menuHelper.getAction();

      if (currentAction === 'OPTION') {
        const option = parseInt(mess.body);
        if (isNaN(option) && menuHelper.isOptionExist(option, 'ADMIN')) {
          await mess.reply('Opcion invalida');
          return;
        }

        if (option === 1) {
          menuHelper.setCurrentMenu('MAIN');
          const menu = menuHelper.getCurrentMenu();
          const { response, menuLength } = await this.loadMenu(menu);

          const message = await chat.sendMessage(
            `Selecciona del 1 al ${menuLength}\n${response}`,
          );
          session.addMessage(new Message(message, mess.body, 'MAIN'));

          return;
        }

        if (option === 2) {
          const optionToSend = menuHelper.getOptionByOrder(3);
          if (optionToSend) {
            menuHelper.setAction('ANSWER');
            const message = await chat.sendMessage(optionToSend.text);
            session.addMessage(new Message(message, mess.body, 'ADMIN'));
          }
        }
      } else {
        const option = menuHelper.getOption();
        if (option) {
          const text = mess.body;
          if (option.order === 3) {
            const optionToSend = menuHelper.getOptionByOrder(4);
            if (optionToSend) {
              const message = await chat.sendMessage(optionToSend.text);
              session.setPayload({
                option: {
                  title: text,
                  description: '',
                },
              });
              session.addMessage(new Message(message, mess.body, 'ADMIN'));
            }
          } else {
            const payload = session.getPayload();
            if (payload.option) {
              menuHelper.setOrderOption(0);
              menuHelper.setAction('OPTION');

              const title = payload.option.title;
              const description = mess.body;
              const menuToUpdate = this.menus.find(
                (_menu) => _menu.type === 'MAIN',
              );
              if (menuToUpdate) {
                await botOptionRepository.createOptionWithOrder(
                  {
                    data: {
                      order: 0,
                      text: title,
                      botAnswer: {
                        create: {
                          text: description,
                        },
                      },
                      botMenuId: menuToUpdate.id,
                    },
                  },
                  menuToUpdate,
                );

                await chat.sendMessage('Opcion agregada exitosamente');

                const menu = menuHelper.getCurrentMenu();
                const { response, menuLength } = await this.loadMenu(menu);

                const message = await chat.sendMessage(
                  `Selecciona del 1 al ${menuLength}\n${response}`,
                );
                session.addMessage(new Message(message, mess.body, 'ADMIN'));
                await this.updateMenus();
              }
            }
          }
        }
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async mainResponse({ menuHelper, mess, session, chat }: IResponse) {
    try {
      const currentAction = menuHelper.getAction();
      if (currentAction === 'OPTION') {
        const option = parseInt(mess.body);
        if (isNaN(option) && menuHelper.isOptionExist(option, 'MAIN')) {
          await mess.reply('Opcion invalida');
          return;
        }

        const currentMenu = menuHelper.getCurrentMenu();

        if (
          currentMenu.options.length === 0 ||
          option === currentMenu.options.length + 1
        ) {
          // Go to Reminder
          menuHelper.setCurrentMenu('REMINDER');
          menuHelper.setAction('ANSWER');

          const optionToSend = menuHelper.getOptionByOrder(1);
          if (optionToSend) {
            const message = await chat.sendMessage(optionToSend.text);
            session.addMessage(new Message(message, mess.body, 'REMINDER'));
          }
        } else {
          const optionToSend = menuHelper.getOptionByOrder(option);
          if (optionToSend && optionToSend.botAnswer) {
            const message = await chat.sendMessage(optionToSend.botAnswer.text);
            session.addMessage(new Message(message, mess.body, 'MAIN'));

            const { response, menuLength } = await this.loadMenu(currentMenu);

            await chat.sendMessage(
              `Selecciona del 1 al ${menuLength}\n${response}`,
            );
          }
        }
      } else {
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async sendMessage(chat: Chat, mess: MessageWs) {
    try {
      const session = this.sessionObserver.getSessionById(chat.id.user);
      if (!session) return;

      const menuHelper = session.getMenuHelper();

      // Interfaz si quiere seguir usando la app
      if (session.getWishContinue()) {
        if (mess.body.toLowerCase() === 'si') {
          session.setWishContinue(false);
          const message = session.getLastMessage();
          if (message) {
            await chat.sendMessage(message.getMessage().body);
          }
        } else if (mess.body.toLowerCase() === 'no') {
          this.sessionObserver.removeSessionById(session.getId());
          await chat.sendMessage('Gracias por usar el asistente de Jollyn');
        } else {
          await chat.sendMessage('Por favor, responda si o no');
        }
        return;
      }

      if (menuHelper.type === $Enums.BotMenuType.ADMIN) {
        await this.adminResponse({ chat, mess, menuHelper, session });
      }
      if (menuHelper.type === $Enums.BotMenuType.MAIN) {
        await this.mainResponse({ chat, mess, menuHelper, session });
      }
      if (menuHelper.type === $Enums.BotMenuType.REMINDER) {
        await this.reminderResponse({ chat, mess, menuHelper, session });
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
