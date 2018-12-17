import IService from './service/Service';
import {Config} from './Config';
import {Container, Registry} from './Container';
import registry from './registry';
import {IHeartbeatServer} from './service/HeartbeatServer';
import {IAPIServer} from './service/APIServer';
import PGClient from './service/PGClient';
import Chainsaw from './service/Chainsaw';
import {INodeStatusService} from './service/NodeStatusService';
import {IMaterializationService} from './service/MaterializationService';

export default class Backend implements IService {
  private readonly config: Config;
  private readonly registry: Registry;
  private readonly container: Container;

  constructor (config: Config) {
    this.config = config;

    const internalRegistry = new Registry();
    internalRegistry.bind('Config', () => config);
    this.registry = registry(internalRegistry);
    this.container = new Container(this.registry);
  }

  async start (): Promise<void> {
    const pg = await this.container.resolve<PGClient>('PGClient');
    await pg.start();
    const hbServer = await this.container.resolve<IHeartbeatServer>('HeartbeatServer');
    await hbServer.start();
    const apiServer = await this.container.resolve<IAPIServer>('APIServer');
    await apiServer.start();
    const nsd = await this.container.resolve<INodeStatusService>('NodeStatusService');
    await nsd.start();
    const materializer = await this.container.resolve<IMaterializationService>('MaterializationService');
    await materializer.start();

    if (this.config.isMaster) {
      const chainsaw = await this.container.resolve<Chainsaw>('Chainsaw');
      await chainsaw.start();
    }
  }

  async stop (): Promise<void> {
    return undefined;
  }
}