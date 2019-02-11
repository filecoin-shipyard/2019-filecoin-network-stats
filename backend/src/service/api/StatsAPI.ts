import {Request, Response} from 'express';
import IAPIService from './IAPIService';
import {IMiningStatsDAO} from '../dao/MiningStatsDAO';
import {IMarketStatsDAO} from '../dao/MarketStatsDAO';
import {IStorageStatsDAO} from '../dao/StorageStatsDAO';
import {INodeStatusService} from '../NodeStatusService';
import {ITokenStatsDAO} from '../dao/TokenStatsDAO';
import durationPathRegex from '../../util/durationPathRegex';
import {chartDurationFromString} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {timeseriesDatapointToJSON} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {categoryDatapointToJSON} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';

export default class StatsAPI implements IAPIService {
  namespace = 'stats';

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

  private historicalMinerCountStats = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalMinerCountStats(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalStoragePrice = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalStoragePrice(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalCollateral = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalCollateral(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalCollateralPerGB = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalCollateralPerGB(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalStorageAmount = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalStorageAmount(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalUtilization = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.ssd.historicalUtilization(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalBlockRewards = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.tsd.historicalBlockRewards(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  private historicalCoinsInCirculation = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.tsd.historicalCoinsInCirculation(dur);
    return res.json(data.map(categoryDatapointToJSON));
  };

  private historicalTokenVolume = async (req: Request, res: Response) => {
    const dur = chartDurationFromString(req.params.duration);
    const data = await this.mksd.historicalVolume(dur);
    return res.json(data.map(timeseriesDatapointToJSON));
  };

  GET = {
    [`storage/historicalMinerCounts/:duration(${durationPathRegex})`]: this.historicalMinerCountStats,
    [`storage/historicalStoragePrice/:duration(${durationPathRegex})`]: this.historicalStoragePrice,
    [`storage/historicalCollateral/:duration(${durationPathRegex})`]: this.historicalCollateral,
    [`storage/historicalCollateralPerGB/:duration(${durationPathRegex})`]: this.historicalCollateralPerGB,
    [`storage/historicalStorageAmount/:duration(${durationPathRegex})`]: this.historicalStorageAmount,
    [`storage/historicalUtilization/:duration(${durationPathRegex})`]: this.historicalUtilization,
    [`token/historicalBlockRewards/:duration(${durationPathRegex})`]: this.historicalBlockRewards,
    [`token/historicalCoinsInCirculation/:duration(${durationPathRegex})`]: this.historicalCoinsInCirculation,
    [`market/historicalTokenVolume/:duration(${durationPathRegex})`]: this.historicalTokenVolume,
  };
}