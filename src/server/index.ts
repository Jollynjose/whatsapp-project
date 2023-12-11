import Config from './config';

import express, { Express } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ConfigEnum } from './config/config.enum';
import { authRouter } from './routers';

class Server {
  private PORT: number;
  private app: Express;
  constructor() {
    this.PORT = Number(Config.get(ConfigEnum.PORT));
    this.app = express();

    this.middlewares();
    this.setRoutes();
  }

  private middlewares() {
    this.app.use(bodyParser.json());
    this.app.use(morgan('tiny'));
    this.app.use(cookieParser());
    this.app.use(cors());
  }

  private setRoutes() {
    this.app.use('/api', authRouter.default);
  }

  start() {
    this.app.listen(this.PORT, async () => {
      console.log(`Server is listen on port: ${this.PORT}`);
    });
  }
}

export default new Server();
