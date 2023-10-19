import { controllers } from 'src/types/tControllers';
import { routers } from 'src/types/tRouter';
import client from './whatsapp';
import Config from './config';

import express, { Express } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ConfigEnum } from './config/config.enum';

type ServerParams = {
  routers: routers;
  controllers: controllers;
};

class Server {
  private PORT: number;
  private app: Express;
  constructor({ routers }: ServerParams) {
    this.PORT = Number(Config.get(ConfigEnum.PORT));
    this.app = express();

    this.middlewares();
    this.setRoutes(routers);
  }

  private middlewares() {
    this.app.use(bodyParser.json());
    this.app.use(morgan('tiny'));
    this.app.use(cookieParser());
    this.app.use(cors());
  }

  private setRoutes(routers: routers) {
    this.app.get('/seeds', (req, res) => {
      res.send('in this endpoint load seed');
    });
  }

  start() {
    this.app.listen(this.PORT, async () => {
      console.log(`Server is listen on port: ${this.PORT}`);
      client.initialize();
    });
  }
}

export default new Server({ routers: {}, controllers: {} });
