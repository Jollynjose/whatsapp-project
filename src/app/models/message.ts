import { MenuWithOptionsAndAnswer } from 'src/types/tMenu';
import { Message as MessageWS } from 'whatsapp-web.js';

export class Message {
  private message: MessageWS;
  private id: string;
  constructor(id: string, message: MessageWS) {
    this.message = message;
    this.id = id;
  }

  getMessage() {
    return this.message;
  }

  getId() {
    return this.id;
  }
}
