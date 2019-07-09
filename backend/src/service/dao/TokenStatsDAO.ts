import {TokenStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import BigNumber from 'bignumber.js';
import {generateDurationSeries} from '../../util/generateDurationSeries';
import {DEFAULT_CACHE_TIME, ICacheService} from '../CacheService';

export interface ITokenStatsDAO {
  getStats (): Promise<TokenStats>

  materializeTokenStats (): Promise<void>

  historicalBlockRewards (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalCoinsInCirculation (dur: ChartDuration): Promise<CategoryDatapoint[]>
}

export class PostgresTokenStatsDAO implements ITokenStatsDAO {
  private readonly client: PGClient;

  private readonly cs: ICacheService;

  constructor (client: PGClient, cs: ICacheService) {
    this.client = client;
    this.cs = cs;
  }

  getStats = () => this.cs.wrapMethod('token-stats', DEFAULT_CACHE_TIME, () => {
    return this.client.execute(async (client: PoolClient) => {
      return {
        tokenHoldingsDistribution: await this.getTokenHoldingsHistogram(client),
        blockRewardsOverTime: await this.getHistoricalBlockRewards(client, ChartDuration.MONTH),
        coinsInCirculation: await this.getCoinsInCirculation(client, ChartDuration.MONTH),
      };
    });
  });

  materializeTokenStats (): Promise<void> {
    return this.client.executeTx(async (client: PoolClient) => {
      const uniqueAddressRes = await client.query(`
        SELECT COUNT(DISTINCT m.address) AS unique_addresses
        FROM (SELECT m.to_address AS address FROM unique_messages m
              UNION SELECT m.from_address AS address FROM unique_messages m) AS m;
      `);
      const uniqueAddressCount = uniqueAddressRes.rows[0].unique_addresses;

      const totalCoinsRes = await client.query(`
        SELECT count(*) * 1000 AS total
        FROM blocks
      `);
      const totalCoins = new BigNumber(totalCoinsRes.rows[0].total);

      const collateralizedCoinsRes = await client.query(`
        SELECT sum(m.value) AS total
        FROM unique_messages m
        WHERE m.method = 'createStorageMiner';
      `);
      const collateralizedCoins = new BigNumber(collateralizedCoinsRes.rows[0].total);

      await client.query(`
        INSERT INTO token_address_stats (unique_address_count, average_holdings, ingested_at)
        VALUES ($1, $2, extract(EPOCH FROM current_timestamp))
      `, [
        uniqueAddressCount,
        0,
      ]);

      await client.query(`
        INSERT INTO coin_circulation_stats (coins_in_collateral, total_coins, ingested_at)
        VALUES ($1, $2, extract(EPOCH FROM current_timestamp))
      `, [
        collateralizedCoins.toFixed(0),
        totalCoins.toFixed(0),
      ]);
    });
  }

  historicalBlockRewards (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalBlockRewards(client, dur));
  }

  historicalCoinsInCirculation (dur: ChartDuration): Promise<CategoryDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getCoinsInCirculation(client, dur));
  }

  private async getTokenHoldingsHistogram (client: PoolClient): Promise<HistogramDatapoint[]> {
    const increment = 500000;
    const bucketCount = 6;

    const res = await client.query(`
      WITH series AS (SELECT g.n, 1 + (${increment} * (g.n - 1)) AS bucket_start, (${increment} * (g.n - 1)) + ${increment} AS bucket_end
                      FROM generate_series(1, ${bucketCount - 1}, 1) g (n)),
           value_transfers AS (SELECT m.to_address AS address, m.value AS value
                               FROM unique_messages m
                               WHERE value > 0
          UNION ALL SELECT m.from_address AS address, -1 * m.value AS value
                    FROM unique_messages m
                    WHERE value > 0
          UNION ALL
          SELECT b.miner AS address, 1000 AS value
          FROM blocks b),
           holdings AS (SELECT address, sum(value) AS value
                        FROM value_transfers
                        WHERE address != ''
                        GROUP BY address
                        HAVING sum(value) > 0),
           counts AS (SELECT count(h.*) AS count, bucket
                      FROM holdings h,
                           width_bucket(h.value, 1, ${increment * (bucketCount - 1)}, ${bucketCount - 1}) AS bucket
                      GROUP BY bucket
                      ORDER BY bucket ASC)
      SELECT s.n AS n, s.bucket_start, s.bucket_end, coalesce(c.count, 0) AS count
      FROM series s
             LEFT JOIN counts c ON c.bucket = s.n
      UNION ALL
      SELECT 10 AS n, ${(increment * (bucketCount - 1)) + 1} AS bucket_start, 0 AS bucket_end, count(h)
      FROM holdings h
      WHERE h.value >= ${(increment * (bucketCount - 1)) + 1}
      ORDER BY n ASC;
    `);

    return res.rows.map((r: any) => ({
      n: Number(r.n),
      bucketStart: new BigNumber(r.bucket_start),
      bucketEnd: new BigNumber(r.bucket_end),
      count: Number(r.count),
    }));
  }

  private async getCoinsInCirculation (client: PoolClient, duration: ChartDuration): Promise<CategoryDatapoint[]> {
    const { durSeq, durBase } = generateDurationSeries(duration);

    const res = await client.query(`
      WITH seq AS (${durSeq})
      SELECT seq.date,
             max(coalesce(cs.coins_in_collateral, 0)) AS coins_in_collateral,
             max(coalesce(cs.total_coins, 0))         AS total_coins
      FROM seq
             LEFT OUTER JOIN coin_circulation_stats cs
               ON seq.date = extract(EPOCH FROM date_trunc('${durBase}', to_timestamp(cs.ingested_at)))
      GROUP BY seq.date
      ORDER BY seq.date ASC;
    `);

    return res.rows.map((r: any) => ({
      category: r.date,
      data:{
        coinsInCollateral: new BigNumber(r.coins_in_collateral),
        liquidCoins: new BigNumber(r.total_coins).minus(r.coins_in_collateral)
      }
    }))
  }

  private async getHistoricalBlockRewards (client: PoolClient, duration: ChartDuration): Promise<TimeseriesDatapoint[]> {
    const {durSeq, durBase} = generateDurationSeries(duration);

    const res = await client.query(`
      WITH d AS (${durSeq})
      SELECT d.date, sum(1000 * count(b)) OVER (ORDER BY DATE asc) AS amount
      FROM d
             LEFT OUTER JOIN blocks b ON d.date = extract(EPOCH FROM date_trunc('${durBase}', to_timestamp(b.ingested_at)))
      GROUP BY d.date
      ORDER BY d.date ASC;
    `)

    return res.rows.map((r: any) => ({
      amount: new BigNumber(r.amount),
      date: Number(r.date)
    }))
  }
}