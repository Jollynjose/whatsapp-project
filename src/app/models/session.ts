import { Chat } from 'whatsapp-web.js';

export class Session {
  private chat: Chat;
  private contactName: string;
  private id: string;
  private lastTimeActive: number;

  constructor({ chat, contactName }: { chat: Chat; contactName: string }) {
    this.chat = chat;
    this.id = chat.id.user;
    this.contactName = contactName;
    this.lastTimeActive = chat.lastMessage.timestamp;

    this.greeting();
  }

  greeting() {
    this.chat.sendMessage(
      `Welcome to Jollyn's Bot, how do you feel ${this.contactName}?`,
    );
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
      this.chat.sendMessage(`Good Bye ${this.contactName}`);
      return true;
    }
    return false;
  }
}

class SessionObserver {
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

  updateLastActivityTime(id: string, lastTimeActive: number) {
    const session = this.getSessionById(id);
    if (session) {
      session.updateLastActivityTime(lastTimeActive);
    }
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

export const sessionObserver = new SessionObserver();
