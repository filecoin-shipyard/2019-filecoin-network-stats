import {Ask} from 'filecoin-network-stats-common/lib/domain/Ask';
import {MarketStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import BigNumber from 'bignumber.js';
import {DEFAULT_CACHE_TIME, ICacheService} from '../CacheService';
import {generateDurationSeries} from '../../util/generateDurationSeries';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';

export interface IMarketStatsDAO {
  getStats (): Promise<MarketStats>
}

export class PostgresMarketStatsDAO implements IMarketStatsDAO {
  private readonly client: PGClient;

  private readonly cs: ICacheService;

  constructor (client: PGClient, cs: ICacheService) {
    this.client = client;
    this.cs = cs;
  }

  getStats = () => this.cs.wrapMethod('market-stats', DEFAULT_CACHE_TIME, () => {
    return this.client.execute(async (client: PoolClient) => {
      let asks: Ask[] = [];
      const askRows = await client.query(
        'SELECT a.*, m.to_address AS address FROM asks a JOIN messages m ON a.message_id = m.id ORDER BY price DESC LIMIT 10',
      );

      if (askRows.rows.length) {
        asks = this.inflateAsks(askRows.rows);
      }

      return {
        asks,
        bids: [],
        volume: await this.getDailyVolume(client),
      };
    });
  });

  async getDailyVolume (client: PoolClient): Promise<TimeseriesDatapoint[]> {
    const { durSeq } = generateDurationSeries(ChartDuration.MONTH);

    const res = await client.query(`
      WITH ts AS (${durSeq}),
           messages AS (SELECT m.*, extract(EPOCH FROM date_trunc('day', to_timestamp(b.ingested_at))) AS ts
                        FROM messages m
                               INNER JOIN blocks b ON b.height = m.height
                        WHERE m.value > 0)
      SELECT t.date as date, coalesce(sum(m.value), 0) AS amount
      FROM ts t
             LEFT OUTER JOIN messages m ON m.ts = t.date
      GROUP BY t.date ORDER BY date ASC;
    `);

    if (!res.rows.length) {
      return [];
    }

    return this.inflateVolume(res.rows);
  }

  inflateVolume (entries: any[]): TimeseriesDatapoint[] {
    return entries.map((e: any) => ({
      amount: new BigNumber(e.amount),
      date: e.date,
    }));
  }

  inflateAsks (asks: any[]): Ask[] {
    return asks.map((ask: any) => ({
      id: Number(ask.id),
      price: new BigNumber(ask.price),
      expiresAt: Number(ask.expires_at),
      address: ask.address,
    }));
  }
}