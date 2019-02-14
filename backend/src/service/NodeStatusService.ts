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

const REFRESH_TIME = 60;

const logger = makeLogger('NodeStatusService');

const ZERO_ADDRESS = 'fcqqqqqqqqqqqqqqqqqqqqqyptunp';

const profanityFilter = new Filter();

export interface INodeStatusService extends IService {
  consumeHeartbeat (heartbeat: Heartbeat): Promise<void>

  listNodes (): Promise<Node[]>

  listMiners (): Promise<Node[]>

  getMinerByAddress (address: string): Promise<Node | null>

  getMinerCounts (): number
}

export class MemoryNodeStatusService implements INodeStatusService {
  private data: { [k: string]: Node } = {};

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

    const lastSeen = this.tsProvider.now();
    let oldLastSeen = 0;
    if (old) {
      oldLastSeen = old.lastSeen;
      old.height = heartbeat.height;
      old.lastSeen = lastSeen;

      if (lastSeen - oldLastSeen > REFRESH_TIME) {
        const power = await this.mps.getRawMinerPower(heartbeat.minerAddress);
        old.power = power.miner / power.total;
        old.capacity = power.miner * SECTOR_SIZE_BYTES;
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
        lastSeen,
        lat: (loc && loc.lat) || null,
        long: (loc && loc.long) || null,
        height: heartbeat.height,
        nickname: sanitizedNick,
        peerId: heartbeat.peerId,
        minerAddress: heartbeat.minerAddress,
        power: power.miner / power.total,
        capacity: power.miner * SECTOR_SIZE_BYTES,
      };

      if (heartbeat.minerAddress) {
        this.addressMap[heartbeat.minerAddress] = heartbeat.peerId;
      }
    }

    this.lru.unshift(this.makeLRUKey(heartbeat.peerId, lastSeen));

    if (old) {
      let i = this.lru.length - 1;

      const oldKey = this.makeLRUKey(old.peerId, oldLastSeen);

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
      delete this.data[peerId];
      this.nodeCount--;
    }
  }

  async listNodes (): Promise<Node[]> {
    return Object.keys(this.data).map((k: string) => this.data[k]);
  }

  async getMinerByAddress (address: string): Promise<Node | null> {
    const miner = this.addressMap[address] ? this.data[this.addressMap[address]] : null;
    return miner && miner.minerAddress !== ZERO_ADDRESS ? miner : null;
  }

  getMinerCounts (): number {
    return this.nodeCount;
  }

  async listMiners (): Promise<Node[]> {
    const nodes = await this.listNodes();
    return nodes.filter((n: Node) => {
      return n.minerAddress !== ZERO_ADDRESS;
    });
  }

  private makeLRUKey (peerId: string, time: number) {
    return `${peerId}:${time}`;
  }
}