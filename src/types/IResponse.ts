import { Session } from '../app/models/session';
import MenuHelper from '../app/models/menu';
import { Chat, Message as MessageWs } from 'whatsapp-web.js';

export interface IResponse {
  chat: Chat;
  mess: MessageWs;
  menuHelper: MenuHelper;
  session: Session;
}
