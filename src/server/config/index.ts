import { parse } from 'dotenv';
import fs from 'fs';
import { ConfigEnum } from './config.enum';

class Config {
  private readonly envConfig: { [key: string]: string };
  constructor() {
    const path = __dirname + '/../../.env';
    const existPath = fs.existsSync(path);
    if (!existPath) {
      console.log(`.env file does not exist on path ${path}`);
      process.exit(0);
    }
    this.envConfig = parse(fs.readFileSync(path));
  }

  get(variable: ConfigEnum) {
    return this.envConfig[variable];
  }
}

export default new Config();
