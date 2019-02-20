import {Heartbeat} from '../domain/Heartbeat';
import {ITimestampProvider} from './TimestampProvider';
import {IGeolocationDAO} from './dao/GeolocationDAO';
import {Node} from 'filecoin-network-stats-common/lib/domain/Node';
import {IBlocksDAO} from './dao/BlocksDAO';
import IService from './Service';
import makeLogger from '../util/logger';
import {IMiningPowerService} from './MiningPowerService';
import {SECTOR_SIZE_BYTES} from '../Config';
import Filter = require('bad-words');

// this should be a reasonable number for the time being
const MAX_NODES = 10000;

const REFRESH_TIME_SECONDS = 60;
const DROP_TIME_SECONDS = 60;

const logger = makeLogger('NodeStatusService');

const ZERO_ADDRESS = 'fcqqqqqqqqqqqqqqqqqqqqqyptunp';

const profanityFilter = new Filter();

export interface INodeStatusService extends IService {
  consumeHeartbeat (heartbeat: Heartbeat): Promise<void>

  listNodes (): Promise<Node[]>

  listMiners (): Promise<Node[]>

  getMinerByAddress (address: string): Promise<Node | null>

  getMinerCounts (): Promise<number>
}

interface NodeWithRefresh {
  node: Node
  lastRefreshed: number
}

export class MemoryNodeStatusService implements INodeStatusService {
  private data: { [k: string]: NodeWithRefresh } = {};

  private addressMap: { [k: string]: string } = {};

  private lru: string[] = [];

  private tsProvider: ITimestampProvider;

  private gDao: IGeolocationDAO;

  private blocksDao: IBlocksDAO;

  private mps: IMiningPowerService;

  private nodeCount: number = 0;

  constructor (tsProvider: ITimestampProvider, gDao: IGeolocationDAO, blocksDao: IBlocksDAO, mps: IMiningPowerService) {
    this.tsProvider = tsProvider;
    this.gDao = gDao;
    this.blocksDao = blocksDao;
    this.mps = mps;
  }

  start (): Promise<void> {
    return null;
  }

  stop (): Promise<void> {
    return null;
  }

  async consumeHeartbeat (heartbeat: Heartbeat) {
    const old = this.data[heartbeat.peerId];

    const now = this.tsProvider.now();
    let oldLastSeen = 0;
    if (old) {
      const lastRefreshed = old.lastRefreshed;
      oldLastSeen = old.node.lastSeen;
      old.node.height = heartbeat.height;
      old.node.lastSeen = now;

      if (now - lastRefreshed > REFRESH_TIME_SECONDS) {
        logger.info('performing power update', {
          lastRefreshed: lastRefreshed,
          now: now,
          diff: now - lastRefreshed,
          address: old.node.minerAddress,
          nickname: old.node.nickname,
          peerId: old.node.peerId,
        });
        const power = heartbeat.minerAddress ? await this.mps.getRawMinerPower(heartbeat.minerAddress) : {
          miner: 0,
          total: 1,
        };
        old.node.power = power.miner / power.total;
        old.node.capacity = power.miner * SECTOR_SIZE_BYTES;
        old.lastRefreshed = now;
      } else {
        logger.silly('skipping power update', {
          lastRefreshed: lastRefreshed,
          now: now,
          diff: now - lastRefreshed,
        });
      }
    } else {
      this.nodeCount++;

      logger.info('received new peer', {
        ip: heartbeat.ip,
        peerId: heartbeat.peerId,
        nickname: heartbeat.nickname,
        nodeCount: this.nodeCount,
      });

      const sanitizedNick = profanityFilter.clean(heartbeat.nickname);
      const loc = await this.gDao.locateIp(heartbeat.ip);
      const power = heartbeat.minerAddress ? await this.mps.getRawMinerPower(heartbeat.minerAddress) : {
        miner: 0,
        total: 1,
      };
      this.data[heartbeat.peerId] = {
        node: {
          lastSeen: now,
          lat: (loc && loc.lat) || null,
          long: (loc && loc.long) || null,
          height: heartbeat.height,
          nickname: sanitizedNick,
          peerId: heartbeat.peerId,
          minerAddress: heartbeat.minerAddress,
          power: power.miner / power.total,
          capacity: power.miner * SECTOR_SIZE_BYTES,
        },
        lastRefreshed: now,
      };

      if (heartbeat.minerAddress) {
        this.addressMap[heartbeat.minerAddress] = heartbeat.peerId;
      }
    }

    this.lru.unshift(this.makeLRUKey(heartbeat.peerId, now));

    if (old) {
      let i = this.lru.length - 1;

      const oldKey = this.makeLRUKey(old.node.peerId, oldLastSeen);

      while (i >= 1) {
        if (this.lru[i] === oldKey) {
          this.lru.splice(i, 1);
          break;
        }

        i--;
      }
    }

    if (this.lru.length > MAX_NODES) {
      logger.info('LRU is at maximum size, removing older nodes');
      const last = this.lru.pop();
      const peerId = last.split(':')[0];
      const node = this.data[peerId].node;
      delete this.data[peerId];
      delete this.addressMap[node.minerAddress];
      this.nodeCount--;
    }

    for (let i = this.lru.length - 1; i >= 0; i--) {
      const key = this.lru[i];
      const split = key.split(':');
      const [peerId, timeStr] = split;
      const lastSeen = Number(timeStr);
      if (now - lastSeen > DROP_TIME_SECONDS) {
        if (!this.data[peerId]) {
          continue;
        }

        const node = this.data[peerId].node;
        logger.info('dropping unresponsive node', {
          peerId: node.peerId,
          nickname: node.nickname,
          minerAddress: node.minerAddress,
        });
        delete this.data[peerId];
        delete this.addressMap[node.minerAddress];
        this.lru.pop();
        this.nodeCount--;
      } else {
        break;
      }
    }
  }

  async listNodes (): Promise<Node[]> {
    return Object.keys(this.data).map((k: string) => this.data[k].node);
  }

  async getMinerByAddress (address: string): Promise<Node | null> {
    const miner = this.addressMap[address] ? this.data[this.addressMap[address]].node : null;
    return miner && miner.minerAddress && miner.minerAddress !== ZERO_ADDRESS ? miner : null;
  }

  async getMinerCounts (): Promise<number> {
    const miners = await this.listMiners();
    return miners.length;
  }

  async listMiners (): Promise<Node[]> {
    const nodes = await this.listNodes();
    return nodes.filter((n: Node) => {
      return n.minerAddress && n.minerAddress !== ZERO_ADDRESS;
    });
  }

  private makeLRUKey (peerId: string, time: number) {
    return `${peerId}:${time}`;
  }
}