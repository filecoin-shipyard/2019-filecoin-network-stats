import IService from './Service';
import {promisify} from '../util/promisify';
import IConnection from '../../types/IConnection';
import {IHeartbeatConsumer} from './HeartbeatConsumer';
import makeLogger from '../util/logger';
import {Multiaddr} from '../../types/Multiaddr';
import PeerInfo = require('peer-info');
import Node = require('libp2p');
import TCP = require('libp2p-tcp');
import SECIO = require('libp2p-secio');
import MPLEX = require('libp2p-mplex');
import split = require('pull-split');
import pull = require('pull-stream');

const PROTOCOL = 'fil/heartbeat/1.0.0';

const logger = makeLogger('HeartbeatServer');

interface RawHeartbeat {
  Head: string
  Height: number
  Nickname: string
  MinerAddress: string
}

export interface IHeartbeatServer extends IService {
}

class HeartbeatNode extends Node {
  constructor (peerInfo: PeerInfo) {
    super({
      peerInfo: peerInfo,
      modules: {
        transport: [
          TCP,
        ],
        streamMuxer: [
          MPLEX,
        ],
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [],
      },
      config: {
        EXPERIMENTAL: {
          pubsub: false,
        },
      },
    });
  }
}

export class HeartbeatServerImpl implements IHeartbeatServer {
  private readonly peerInfo: PeerInfo;
  private readonly consumer: IHeartbeatConsumer;
  private node: Node | null = null;

  constructor (peerInfo: PeerInfo, consumer: IHeartbeatConsumer) {
    this.peerInfo = peerInfo;
    this.consumer = consumer;
  }

  async start (): Promise<void> {
    this.node = new HeartbeatNode(this.peerInfo);

    await promisify((cb) => this.node.start(cb));
    this.node.handle(PROTOCOL, this.handleProtocol);
    this.node.on('peer:connect', (peerInfo: PeerInfo) => logger.info('peer connected', {
      peerId: peerInfo.id.toB58String(),
    }));
    this.node.on('error', (err: any) => logger.info('heartbeat error', {
      err,
    }));

    logger.info('started heartbeat server');
  }

  stop (): Promise<void> {
    return;
  }

  private handleProtocol = (protocol: string, conn: IConnection) => {
    pull(
      conn,
      pullJSON(),
      pull.drain((data: RawHeartbeat | null) => this.fireHandlers(data, conn)),
    );
  };

  private async fireHandlers (data: RawHeartbeat | null, conn: IConnection) {
    if (!data) {
      return;
    }

    let peerInfo: PeerInfo | null;
    try {
      peerInfo = await promisify((cb) => conn.getPeerInfo(cb));
    } catch (err) {
      logger.warn('failed to get peer info', {
        err,
      });
      return;
    }

    if (!peerInfo || !peerInfo.id) {
      logger.error('peer info is null in heartbeat handler');
      return;
    }

    let addr: Multiaddr;

    try {
      const addrs = await promisify<Multiaddr[]>((cb) => conn.getObservedAddrs(cb));

      if (!addrs.length) {
        return;
      }

      addr = addrs[0];
    } catch (err) {
      logger.error('error thrown getting observed addrs', {err});
      return;
    }

    if (!data.Head || !data.Height) {
      logger.silly('received invalid heartbeat packet', {
        packet: data,
      });
      return;
    }

    this.consumer.handle({
      head: data.Head,
      height: data.Height,
      nickname: data.Nickname,
      peerId: peerInfo.id.toB58String(),
      ip: addr.nodeAddress().address,
      minerAddress: data.MinerAddress,
    });
  }
}

function pullJSON () {
  return pull(
    split(),
    pull.map((line: string) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }),
  );
}