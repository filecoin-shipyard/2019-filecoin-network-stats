import {Request, Response} from 'express';
import IAPIService from './IAPIService';
import {IStorageStatsDAO} from '../dao/StorageStatsDAO';
import csv = require('fast-csv');
import makeLogger from '../../util/logger';

const logger = makeLogger('MinerStatsAPI');

export default class MinerStatsAPI implements IAPIService {
  namespace = 'miners';

  private ssd: IStorageStatsDAO;

  constructor (ssd: IStorageStatsDAO) {
    this.ssd = ssd;
  }

  private csv = async (req: Request, res: Response) => {
    const miners = await this.ssd.getMinerStats();
    const stream = csv.format({ headers: true });
    const id = Math.floor(Date.now() / 1000);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=filecoin-miner-stats-${id}.csv`);
    stream.pipe(res);
    let hasError = false;
    stream.on('error', (err: any) => {
      hasError = true;
      logger.error('Error while generating CSV', {
        err
      });
    });

    for (const miner of miners) {
      if (hasError) {
        break;
      }

      stream.write(miner);
    }

    stream.end();

    if (hasError) {
      res.writeHead(500);
    } else {
      res.writeHead(200);
    }
  };

  GET = {
    'csv': this.csv,
  };
}