import { reminderRepository } from './models/domain';
import client from './modules/whatsapp';

function main() {
  // Server.start();
  client.initialize();
}

main();
