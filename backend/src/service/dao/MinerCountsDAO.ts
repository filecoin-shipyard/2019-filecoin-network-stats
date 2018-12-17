import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {ITimestampProvider} from '../TimestampProvider';

export interface IMinerCountsDAO {
  saveMinerCounts (count: number): Promise<void>
}

export class PostgresMinerCountsDAO implements IMinerCountsDAO {
  private readonly client: PGClient;

  private readonly tsp: ITimestampProvider;

  constructor (client: PGClient, tsp: ITimestampProvider) {
    this.client = client;
    this.tsp = tsp;
  }

  saveMinerCounts (count: number): Promise<void> {
    return this.client.executeTx((client: PoolClient) => client.query(
      'INSERT INTO miner_counts (count, calculated_at) VALUES ($1, $2)',
      [
        count,
        this.tsp.now(),
      ],
    ) as Promise<any>);
  }
}