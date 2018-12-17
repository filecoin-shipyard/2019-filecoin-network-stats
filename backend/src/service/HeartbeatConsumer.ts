import {Heartbeat} from '../domain/Heartbeat';
import makeLogger from '../util/logger';
import {INodeStatusService} from './NodeStatusService';

const logger = makeLogger('HeartbeatConsumer');

export interface IHeartbeatConsumer {
  handle (heartbeat: Heartbeat): void
}

export class HeartbeatConsumerImpl implements IHeartbeatConsumer {
  private readonly nsd: INodeStatusService;

  constructor (nsd: INodeStatusService) {
    this.nsd = nsd;
  }

  handle = (heartbeat: Heartbeat) => {
    logger.silly('received heartbeat', {
      heartbeat,
    });

    this.nsd.consumeHeartbeat(heartbeat)
      .catch((err: any) => logger.error('failed to consume heartbeat', {err}));
  };
}