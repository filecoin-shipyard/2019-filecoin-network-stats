import {Heartbeat} from '../domain/Heartbeat';
import {ITimestampProvider} from './TimestampProvider';
import {IGeolocationDAO} from './dao/GeolocationDAO';
import {Node} from 'filecoin-network-stats-common/lib/domain/Node';
import {IBlocksDAO} from './dao/BlocksDAO';
import IService from './Service';
import makeLogger from '../util/logger';
import {IMiningPowerService} from './MiningPowerService';

// this should be a reasonable number for the time being
const MAX_NODES = 10000;

const FIVE_MINUTES = 5 * 60;

const logger = makeLogger('NodeStatusService');

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

      const block = await this.blocksDao.byHeight(heartbeat.height);
      if (block) {
        old.tipsetHash = block.cid;
      }

      if (lastSeen - oldLastSeen > FIVE_MINUTES) {
        const power = await this.mps.getRawMinerPower(heartbeat.minerAddress);
        old.power = power.miner/power.total;
        old.capacity = power.miner;
      }
    } else {
      logger.info('received new peer', {
        ip: heartbeat.ip,
        peerId: heartbeat.peerId,
        nickname: heartbeat.nickname,
      });

      this.nodeCount++;
      const loc = await this.gDao.locateIp(heartbeat.ip);
      const power = heartbeat.minerAddress ? await this.mps.getRawMinerPower(heartbeat.minerAddress) : {
        miner: 0,
        total: 1
      };
      this.data[heartbeat.peerId] = {
        lastSeen,
        lat: (loc && loc.lat) || null,
        long: (loc && loc.long) || null,
        height: heartbeat.height,
        tipsetHash: heartbeat.head.replace(/(\{|\}|\s)/ig, ''),
        nickname: heartbeat.nickname,
        peerId: heartbeat.peerId,
        minerAddress: heartbeat.minerAddress,
        power: power.miner/power.total,
        // power.miner is in GB, so multiply by 1000 to get GB
        capacity: power.miner * 1000,
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
    return this.addressMap[address] ? this.data[this.addressMap[address]] : null;
  }

  getMinerCounts (): number {
    return this.nodeCount;
  }

  async listMiners (): Promise<Node[]> {
    // todo: filter
    return this.listNodes();
  }

  private makeLRUKey (peerId: string, time: number) {
    return `${peerId}:${time}`;
  }
}