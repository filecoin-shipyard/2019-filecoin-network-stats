import IAPIService from './IAPIService';
import {Request, Response} from 'express';
import {IMiningStatsDAO} from '../dao/MiningStatsDAO';
import {IMarketStatsDAO} from '../dao/MarketStatsDAO';
import {statsToJSON} from 'filecoin-network-stats-common/lib/domain/Stats';
import {IStorageStatsDAO} from '../dao/StorageStatsDAO';
import {INodeStatusService} from '../NodeStatusService';
import {ITokenStatsDAO} from '../dao/TokenStatsDAO';

export default class SyncAPI implements IAPIService {
  namespace = 'sync';

  private readonly msd: IMiningStatsDAO;

  private readonly mksd: IMarketStatsDAO;

  private readonly ssd: IStorageStatsDAO;

  private readonly nsd: INodeStatusService;

  private readonly tsd: ITokenStatsDAO;

  constructor (msd: IMiningStatsDAO, mksd: IMarketStatsDAO, ssd: IStorageStatsDAO, nsd: INodeStatusService, tsd: ITokenStatsDAO) {
    this.msd = msd;
    this.mksd = mksd;
    this.ssd = ssd;
    this.nsd = nsd;
    this.tsd = tsd;
  }

  private stats = async (req: Request, res: Response) => {
    const mining = await this.msd.getStats();
    const market = await this.mksd.getStats();
    const storage = await this.ssd.getStats();
    const nodes = await this.nsd.listNodes();
    const token = await this.tsd.getStats();

    res.json(statsToJSON({
      mining,
      market,
      storage,
      nodes,
      token,
    }));
  };

  GET = {
    '': this.stats,
  };
}