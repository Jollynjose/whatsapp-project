import express, { Express } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { controllers } from 'src/types/tControllers';
import { routers } from 'src/types/tRouter';

type ServerParams = {
  PORT: number;
  routers: routers;
  controllers: controllers;
};

class Server {
  private PORT: number;
  private app: Express;
  constructor({ PORT, routers }: ServerParams) {
    this.PORT = PORT;
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
    this.app.get('/', (req, res) => {
      res.send('Hello world');
    });
  }

  start() {
    this.app.listen(this.PORT, () => {
      console.log(`Server is listen on port: ${this.PORT}`);
    });
  }
}

export default new Server({ PORT: 3000, routers: {}, controllers: {} });
