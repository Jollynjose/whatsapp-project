import { $Enums } from '@prisma/client';
import { Message as MessageWS } from 'whatsapp-web.js';

export class Message {
  private message: MessageWS;
  private menuType: $Enums.BotMenuType;
  private body: string;

  constructor(message: MessageWS, body: string, menuType: $Enums.BotMenuType) {
    this.message = message;
    this.menuType = menuType;
    this.body = body;
  }

  getBody() {
    return this.body;
  }

  getMenuType() {
    return this.menuType;
  }

  getMessage() {
    return this.message;
  }
}
