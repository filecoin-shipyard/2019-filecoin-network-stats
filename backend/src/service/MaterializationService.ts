import IService from './Service';
import {ITokenStatsDAO} from './dao/TokenStatsDAO';
import {IStorageStatsDAO} from './dao/StorageStatsDAO';
import makeLogger from '../util/logger';
import {INodeStatusService} from './NodeStatusService';
import {IMinerCountsDAO} from './dao/MinerCountsDAO';
import Timeout = NodeJS.Timeout;

const FIVE_MINUTES = 5 * 60 * 1000;

const logger = makeLogger('MaterializationService');

export interface IMaterializationService extends IService {
}

export class MaterializationServiceImpl implements IMaterializationService {
  private readonly tsd: ITokenStatsDAO;

  private readonly ssd: IStorageStatsDAO;

  private readonly nss: INodeStatusService;

  private readonly mcd: IMinerCountsDAO;

  private timeout: Timeout | null = null;

  constructor (tsd: ITokenStatsDAO, ssd: IStorageStatsDAO, nss: INodeStatusService, mcd: IMinerCountsDAO) {
    this.tsd = tsd;
    this.ssd = ssd;
    this.nss = nss;
    this.mcd = mcd;
  }

  async start (): Promise<void> {
    logger.info('waiting for chainsaw before materializing stats');
    setTimeout(() => this.poll(), 30000);
  }

  async stop (): Promise<void> {
    clearTimeout(this.timeout);
  }

  private async poll () {
    try {
      await this.tsd.materializeTokenStats();
      await this.ssd.materializeUtilizationStats();
      await this.mcd.saveMinerCounts(this.nss.getMinerCounts());
      logger.info('successfully materialized state');
    } catch (e) {
      logger.error('caught error while materializing stats', e);
    } finally {
      this.timeout = setTimeout(this.poll, FIVE_MINUTES);
    }
  }
}