import IService from './Service';
import IAPIService from './api/IAPIService';
import * as express from 'express';
import {Config} from '../Config';
import makeLogger from '../util/logger';
import {promisify} from '../util/promisify';
import cors = require('cors');

const logger = makeLogger('APIServer');

export interface IAPIServer extends IService {
}

export class ExpressAPIServer implements IAPIServer {
  private readonly apiServices: IAPIService[];
  private readonly config: Config;
  private readonly app: express.Application;

  constructor (config: Config, apiServices: IAPIService[]) {
    this.apiServices = apiServices;

    this.app = express();
    this.app.use(cors());
    this.app.options('*', cors());
    this.config = config;
  }

  async start (): Promise<void> {
    for (let i = 0; i < this.apiServices.length; i++) {
      const service = this.apiServices[i];
      const router = express.Router();
      this.mountMethod('GET', service, router);
      this.mountMethod('POST', service, router);
      this.app.use('/' + service.namespace, router);
    }

    await promisify((cb) => this.app.listen(this.config.apiPort, cb));
    logger.info('API server started', {port: this.config.apiPort});
  }

  async stop (): Promise<void> {
    return undefined;
  }

  private mountMethod (method: 'GET' | 'POST', service: IAPIService, router: express.Router) {
    if (!service[method]) {
      return;
    }

    const routes = Object.keys(service[method]);
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const handler = service[method][route];
      const wrappedHandler = async (req: express.Request, res: express.Response) => {
        try {
          await handler(req, res);
        } catch (err) {
          logger.error('caught exception in URL handler', { err, route });
          res.sendStatus(500);
        }
      };

      (router as any)[method.toLowerCase()]('/' + route, wrappedHandler);
      logger.info('mounted route', {
        path: `/${service.namespace}/${route}`,
        method,
      });
    }
  }
}