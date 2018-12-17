import {MiningStats} from '../../domain/MiningStats';
import PGClient from '../PGClient';
import {PoolClient} from 'pg';

export interface IMiningStatsDAO {
  getStats (): Promise<MiningStats>
}

export class PostgresMiningStatsDAO implements IMiningStatsDAO {
  private readonly client: PGClient;

  constructor (client: PGClient) {
    this.client = client;
  }

  async getStats (): Promise<MiningStats> {
    return this.client.execute(async (client: PoolClient) => {
      const data = await client.query('SELECT * FROM blocks ORDER BY height DESC LIMIT 1');

      if (!data.rows.length) {
        return {
          lastBlockHeight: 0,
          lastBlockTime: 0,
          averageBlockTime: 0,
          minerName: null,
          minerAddress: '',
        };
      }

      const avgRes = await client.query(`
        WITH timings AS (SELECT b.ingested_at - lag(b.ingested_at) OVER (ORDER BY b.ingested_at ASC) AS timing
                         FROM blocks b
                         ORDER BY b.height DESC
                         LIMIT 100)
        SELECT avg(timings.timing)
        FROM timings;
      `);

      let averageBlockTime = 0;
      if (avgRes.rows.length) {
        averageBlockTime = Number(avgRes.rows[0].avg)
      }

      const row = data.rows[0];

      return {
        lastBlockHeight: row.height,
        lastBlockTime: Number(row.ingested_at),
        averageBlockTime,
        minerName: null,
        minerAddress: row.miner,
      };
    });
  }
}