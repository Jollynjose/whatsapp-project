import { Chat } from 'whatsapp-web.js';
import { Message } from './message';
import MenuHelper from './menu';
import { MenuWithOptionsAndAnswer } from 'src/types/tMenu';
import { $Enums, Prisma } from '@prisma/client';
import dayjs from 'dayjs';

type Payload = {
  reminder?: {
    text: string;
    date: dayjs.Dayjs;
  };
  option?: {
    title: string;
    description: string;
  };
};
export class Session {
  private chat: Chat;
  private contactName: string;
  private id: string;
  private lastTimeActive: number;
  private message: Array<Message>;
  private menuHelper: MenuHelper;
  private payload: Payload = {};
  private wishContinue: boolean = false;

  constructor({
    chat,
    contactName,
    isAdmin = false,
    menus,
  }: {
    chat: Chat;
    contactName: string;
    isAdmin: boolean;
    menus: MenuWithOptionsAndAnswer[];
  }) {
    this.chat = chat;
    this.id = chat.id.user;
    this.contactName = contactName;
    this.lastTimeActive = chat.lastMessage.timestamp;
    this.message = Array<Message>();
    this.menuHelper = new MenuHelper(
      isAdmin ? $Enums.BotMenuType.ADMIN : $Enums.BotMenuType.MAIN,
      menus,
    );
  }

  addMessage(Message: Message) {
    this.message.push(Message);
  }

  getMessage(id: string) {
    return this.message.find((Message) => Message.getMenuType() === id);
  }

  getLastMessage() {
    return this.message.slice(-1).length > 0 ? this.message.slice(-1)[0] : null;
  }

  getFirstMessage() {
    return this.message[0];
  }

  getChat() {
    return this.chat;
  }

  getId() {
    return this.id;
  }

  setPayload(payload: Payload) {
    this.payload = {
      ...this.payload,
      ...payload,
    };
  }

  getPayload() {
    return this.payload;
  }

  sendMessage(message: string) {
    this.chat.sendMessage(message);
  }

  updateLastActivityTime(lastTimeActive: number) {
    this.lastTimeActive = lastTimeActive;
  }

  getMenuHelper() {
    return this.menuHelper;
  }

  updateMenu(menus: MenuWithOptionsAndAnswer[]) {
    this.menuHelper.updateMenu(menus);
  }

  getWishContinue() {
    return this.wishContinue;
  }

  setWishContinue(wishContinue: boolean) {
    this.wishContinue = wishContinue;
  }

  async checkLastActivityTime() {
    const now = Math.floor(new Date().getTime() / 1000);
    const diff = now - this.lastTimeActive;

    if (diff >= 30 && diff < 60) {
      this.chat.sendMessage(
        `${this.contactName}, Desea Continuar?\n Escriba *Si* para continuar o *No* para finalizar`,
      );
      this.wishContinue = true;
      return false;
    }
    if (diff >= 60) {
      // 60 seconds
      this.chat.sendMessage(`${this.contactName}, hasta la Proxima!`);
      return true;
    }
    return false;
  }
}

export class SessionObserver {
  private sessions: Array<Session>;
  constructor() {
    this.sessions = Array<Session>();
    this.checkSession();
  }

  addSession(session: Session) {
    this.sessions.push(session);
  }

  getSessionById(id: string) {
    return this.sessions.find((session) => session.getId() === id);
  }

  getSessions() {
    return this.sessions;
  }

  removeSessionById(id: string) {
    this.sessions = this.sessions.filter((session) => session.getId() !== id);
  }

  isSessionExist(id: string) {
    return this.sessions.some((session) => session.getId() === id);
  }

  updateLastActivityTime({
    lastTimeActive,
    session,
  }: {
    lastTimeActive: number;
    session: Session;
  }) {
    session.updateLastActivityTime(lastTimeActive);
  }

  private checkSession() {
    setInterval(() => {
      this.sessions.forEach(async (session) => {
        if (await session.checkLastActivityTime()) {
          this.removeSessionById(session.getId());
        }
      });
    }, 30000);
  }

  updateMenus(menus: MenuWithOptionsAndAnswer[]) {
    this.sessions.forEach((session) => {
      session.updateMenu(menus);
    });
  }
}
