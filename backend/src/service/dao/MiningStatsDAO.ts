import {MiningStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {INodeStatusService} from '../NodeStatusService';
import {DEFAULT_CACHE_TIME, ICacheService} from '../CacheService';

export interface IMiningStatsDAO {
  getStats (): Promise<MiningStats>
}

export class PostgresMiningStatsDAO implements IMiningStatsDAO {
  private readonly client: PGClient;

  private readonly nss: INodeStatusService;

  private readonly cs: ICacheService;

  constructor (client: PGClient, nss: INodeStatusService, cs: ICacheService) {
    this.client = client;
    this.nss = nss;
    this.cs = cs;

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
          power: 0,
          blocksInTipset: 0,
          peerId: '',
        };
      }

      const blocksInTipsetRes = await client.query(
        'SELECT COUNT(*) AS count FROM blocks WHERE height = $1',
        [
          data.rows[0].height,
        ],
      );

      const blocksInTipset = Number(blocksInTipsetRes.rows[0].count);
      const averageBlockTime = await this.getAvgBlockTime();

      const row = data.rows[0];
      const minerAddress = row.miner;

      const miner = await this.nss.getMinerByAddress(minerAddress);
      let power = 0;
      let peerId = '';

      if (miner) {
        power = miner.power;
        peerId = miner.peerId;
      }

      return {
        lastBlockHeight: row.height,
        lastBlockTime: Number(row.ingested_at),
        averageBlockTime,
        minerName: null,
        minerAddress,
        power,
        blocksInTipset,
        peerId,
      };
    });
  }

  async getAvgBlockTime (): Promise<number> {
    return this.cs.wrapMethod('mining-stats-average-block-time', DEFAULT_CACHE_TIME, () => this.client.execute(async (client: PoolClient) => {
      const avgRes = await client.query(`
        WITH lim_blocks as (
	        SELECT * FROM blocks b ORDER BY b.height DESC LIMIT 100
        ),
        timings AS (SELECT b.ingested_at - lag(b.ingested_at) OVER (ORDER BY b.ingested_at ASC) AS timing
                         FROM lim_blocks b)
        SELECT avg(timings.timing)
        FROM timings;
      `);

      let averageBlockTime = 0;
      if (avgRes.rows.length) {
        averageBlockTime = Number(avgRes.rows[0].avg);
      }

      return averageBlockTime;
    }));
  }
}