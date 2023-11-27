import { Chat } from 'whatsapp-web.js';
import { Message } from './message';

export class Session {
  private chat: Chat;
  private contactName: string;
  private id: string;
  private lastTimeActive: number;
  private message: Array<Message>;

  constructor({ chat, contactName }: { chat: Chat; contactName: string }) {
    this.chat = chat;
    this.id = chat.id.user;
    this.contactName = contactName;
    this.lastTimeActive = chat.lastMessage.timestamp;
    this.message = Array<Message>();
  }

  addMessage(Message: Message) {
    this.message.push(Message);
  }

  getMessage(id: string) {
    return this.message.find((Message) => Message.getId() === id);
  }

  getLastMessage() {
    return this.message[this.message.length - 1];
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

  sendMessage(message: string) {
    this.chat.sendMessage(message);
  }

  updateLastActivityTime(lastTimeActive: number) {
    this.lastTimeActive = lastTimeActive;
  }

  async checkLastActivityTime() {
    const now = Math.floor(new Date().getTime() / 1000);
    const diff = now - this.lastTimeActive;

    // 60 seconds
    if (diff >= 60) {
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
}
