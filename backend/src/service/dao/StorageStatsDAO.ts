import {StorageStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import {MinerStat} from 'filecoin-network-stats-common/lib/domain/MinerStat';
import {CostCapacityForMinerStat} from 'filecoin-network-stats-common/lib/domain/CostCapacityForMinerStat';
import {Node} from 'filecoin-network-stats-common/lib/domain/Node';
import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import BigNumber from 'bignumber.js';
import {INodeStatusService} from '../NodeStatusService';
import {generateDurationSeries} from '../../util/generateDurationSeries';

export interface IStorageStatsDAO {
  getStats (): Promise<StorageStats>

  getMinerStats (): Promise<MinerStat[]>

  historicalMinerCountStats (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalStoragePrice (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalCollateral (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalCollateralPerGB (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalStorageAmount (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  historicalUtilization (dur: ChartDuration): Promise<TimeseriesDatapoint[]>

  materializeUtilizationStats(): Promise<void>
}

const ONE_PB = 1000000;

export class PostgresStorageStatsDAO implements IStorageStatsDAO {
  private readonly client: PGClient;

  private readonly nss: INodeStatusService;

  constructor (client: PGClient, nss: INodeStatusService) {
    this.client = client;
    this.nss = nss;
  }

  getStats (): Promise<StorageStats> {
    return this.client.execute(async (client: PoolClient) => {
      return {
        storageAmount: await this.getAmountStats(client),
        storageCost: await this.getCostStats(client),
        historicalCollateral: await this.getHistoricalCollateral(client, ChartDuration.MONTH),
        historicalCollateralPerGB: await this.getHistoricalCollateralPerGB(client, ChartDuration.MONTH),
        historicalMinerCounts: await this.getHistoricalMinerCounts(client, ChartDuration.MONTH),
        capacityHistogram: await this.getCapacityHistogram(client),
        miners: await this.getMiners(client),
        networkUtilization: await this.getHistoricalUtilization(client, ChartDuration.MONTH),
        distributionOverTime: await this.getMiningDistributionOverTime(client),
        evolution: await this.getMiningEvolution(client),
        costCapacityBySize: [
          await this.getCostCapacityBySize(client, ONE_PB, 'lt'),
          await this.getCostCapacityBySize(client, ONE_PB, 'gte'),
        ]
      };
    });
  }

  getMinerStats (): Promise<MinerStat[]> {
    return this.client.execute((client: PoolClient) => this.getMiners(client));
  }

  historicalMinerCountStats (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalMinerCounts(client, dur));
  }

  historicalStoragePrice (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalStoragePrice(client, dur));
  }

  historicalCollateral (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalCollateral(client, dur));
  }

  historicalCollateralPerGB (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalCollateralPerGB(client, dur));
  }

  historicalStorageAmount (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalStorageAmount(client, dur));
  }

  historicalUtilization (dur: ChartDuration): Promise<TimeseriesDatapoint[]> {
    return this.client.execute((client: PoolClient) => this.getHistoricalUtilization(client, dur));
  }

  materializeUtilizationStats (): Promise<void> {
    return this.client.executeTx((client: PoolClient) => client.query(`
      WITH total_sectors AS (SELECT sum(s.commitments) AS total
                             FROM (SELECT count(DISTINCT m.params->>0) AS commitments
                                   FROM messages m
                                   WHERE method = 'commitSector'
                                   GROUP BY m.to_address) s),
           total_pledges AS (SELECT sum(cast(m.params->>0 AS integer)) AS total
                             FROM messages m
                             WHERE method = 'createMiner'),
           vals AS (SELECT s.total AS total_committed_gb,
                           p.total AS total_pledges_gb,
                           extract(EPOCH FROM current_timestamp)
                    FROM total_sectors s,
                         total_pledges p)
      INSERT INTO network_usage_stats (total_committed_gb, total_pledges_gb, calculated_at)
      SELECT *
      FROM vals;
    `) as Promise<any>);
  }

  private async getHistoricalStorageAmount (client: PoolClient, duration: ChartDuration): Promise<TimeseriesDatapoint[]> {
    const {durSeq, durBase} = generateDurationSeries(duration);

    const points = await client.query(`
      WITH seq AS (${durSeq}),
           grp AS (SELECT max(coalesce(total_pledges_gb, 0)) AS amount, seq.date AS date
                   FROM seq
                          LEFT OUTER JOIN network_usage_stats m
                            ON seq.date = extract(EPOCH FROM date_trunc('${durBase}', to_timestamp(m.calculated_at)))
                   GROUP BY seq.date
                   ORDER BY date ASC)
      SELECT (CASE
                WHEN g.amount = 0 THEN max(g.amount::integer) OVER w
                ELSE g.amount END) AS amount, g.date
      FROM grp g WINDOW w AS (ORDER BY g.date)
      ORDER BY g.date ASC;
    `);

    return this.inflateTimeseriesDatapoints(points.rows);
  }

  private async getAmountStats (client: PoolClient) {
    const data = await this.getHistoricalStorageAmount(client, ChartDuration.MONTH);
    let total = new BigNumber(0);
    if (data.length) {
      total = data[data.length - 1].amount;
    }

    const trend = this.calculateTrend(data);

    return {
      total,
      trend,
      data,
    };
  }

  private async getCostStats (client: PoolClient) {
    const data = await this.getHistoricalStoragePrice(client, ChartDuration.MONTH);
    let average = new BigNumber(0);
    if (data.length) {
      for (const point of data) {
        average = average.plus(point.amount);
      }
      average = average.div(data.length);
    }

    const trend = this.calculateTrend(data);

    return {
      average,
      trend,
      data,
    };
  }

  private async getHistoricalStoragePrice(client: PoolClient, duration: ChartDuration): Promise<TimeseriesDatapoint[]> {
    const { durSeq, durBase } = generateDurationSeries(duration);

    const points = await client.query(`
      with d as (${durSeq}),
           a as (select avg(a.price) as avg, extract(epoch from date_trunc('${durBase}', to_timestamp(b.ingested_at))) as date
                 from asks a
                        join messages m on a.message_id = m.id
                        join blocks b on b.height = m.height
                 group by date)
      select d.date, floor(coalesce(a.avg, 0) / 1000000000000000000) as amount
      from d
             left outer join a on a.date = d.date
      order by d.date asc;
    `);

    return this.inflateTimeseriesDatapoints(points.rows);
  }

  private async getHistoricalCollateral (client: PoolClient, duration: ChartDuration) {
    const { durSeq, durBase } = generateDurationSeries(duration);

    const dailyPoints = await client.query(`
      with d as (${durSeq}),
           m as (select sum(m.value)                                                       as amount,
                        extract(epoch from date_trunc('${durBase}', to_timestamp(b.ingested_at))) as date
                 from messages m
                        join blocks b on m.height = b.height
                 where m.method = 'createMiner'
                 group by date)
      select d.date as date, sum(coalesce(amount, 0)) over (order by d.date asc) as amount
      from d
             left outer join m on d.date = m.date
      order by date asc;
    `);

    return this.inflateTimeseriesDatapoints(dailyPoints.rows);
  }

  private async getHistoricalCollateralPerGB (client: PoolClient, duration: ChartDuration) {
    const { durSeq, durBase } = generateDurationSeries(duration);

    const dailyPoints = await client.query(`
      with d as (${durSeq}),
           m as (select sum(m.value)                                                       as collateral,
                        sum(cast(m.params->>0 as bigint))                                  as gb,
                        extract(epoch from date_trunc('${durBase}', to_timestamp(b.ingested_at))) as date
                 from messages m
                        join blocks b on m.height = b.height
                 where m.method = 'createMiner'
                 group by date)
      select d.date,
             coalesce(m.collateral, 0) as collateral,
             coalesce(gb, 0)           as gb,
             (case
                when gb > 0 then collateral / gb
                else 0 end)            as amount
      from d
             left outer join m on d.date = m.date
      order by date asc;
    `);

    return this.inflateTimeseriesDatapoints(dailyPoints.rows);
  }

  private async getHistoricalMinerCounts (client: PoolClient, duration: ChartDuration) {
    const { durSeq, durBase } = generateDurationSeries(duration);

    const points = await client.query(`
      WITH seq AS (${durSeq})
      SELECT max(coalesce(count, 0)) AS amount, seq.date AS date
      FROM seq
             LEFT OUTER JOIN miner_counts m
               ON seq.date = extract(EPOCH FROM date_trunc('${durBase}', to_timestamp(m.calculated_at)))
      GROUP BY seq.date
      ORDER BY date ASC;
    `);

    return this.inflateTimeseriesDatapoints(points.rows);
  }

  private async getCapacityHistogram (client: PoolClient) {
    const points = await client.query(`
      WITH stats AS (SELECT min(amount) AS min, max(amount) AS max, (max(amount) - min(amount)) / 10 AS step
                     FROM miners),
           series AS (SELECT g.n,
                             stats.min + (step * (g.n - 1))        AS bucket_start,
                             stats.min + (step * (g.n - 1)) + step AS bucket_end
                      FROM generate_series(1, 10, 1) g (n),
                           stats),
           miners AS (SELECT p.*, bucket
                       FROM miners p,
                            stats s,
                            width_bucket(p.amount, s.min, s.max + 1, 10) AS bucket)
      SELECT s.n, s.bucket_start, s.bucket_end, count(p)
      FROM series s
             LEFT OUTER JOIN miners p ON p.bucket = s.n
      GROUP BY s.n, s.bucket_start, s.bucket_end
      ORDER BY s.n ASC;
    `);

    return this.inflateHistogramDatapoint(points.rows);
  }

  private async getMiners (client: PoolClient) {
    const nodes = await this.nss.listMiners();
    const addresses = nodes.map((m: Node) => m.minerAddress);
    const enriched = await client.query(`
      SELECT b.miner                                               AS address,
             max(b.height)                                         AS last_block_mined,
             (count(*)::decimal / (SELECT count(*) FROM blocks)) AS block_percentage
      FROM blocks b
      WHERE b.miner = ANY($1::varchar[])
      GROUP BY b.miner;
    `, [
      addresses,
    ]);
    type BlockIndex = { [k: string]: { blockPercentage: number, address: string, lastBlockMined: number } };
    const index = enriched.rows.reduce((acc: BlockIndex, curr: any) => {
      acc[curr.address] = {
        blockPercentage: curr.block_percentage,
        lastBlockMined: curr.last_block_mined,
        address: curr.address,
      };
      return acc;
    }, {} as BlockIndex);

    const ret: MinerStat[] = [];
    let maxBlock = 0;
    for (const node of nodes) {
      const lastBlockMined = index[node.minerAddress] ? index[node.minerAddress].lastBlockMined : 0;
      if (lastBlockMined > maxBlock) {
        maxBlock = lastBlockMined;
      }

      ret.push({
        nickname: node.nickname,
        address: node.minerAddress,
        peerId: node.peerId,
        tipsetHash: node.tipsetHash,
        power: node.power,
        capacity: node.capacity,
        lastBlockMined,
        blockPercentage: index[node.minerAddress] ? index[node.minerAddress].blockPercentage : 0,
        height: node.height,
        lastSeen: node.lastSeen,
        isInConsensus: false
      });
    }

    for (const node of ret) {
      node.isInConsensus = node.lastBlockMined === maxBlock;
    }

    return ret;
  }

  private async getHistoricalUtilization (client: PoolClient, duration: ChartDuration): Promise<TimeseriesDatapoint[]> {
    const {durSeq, durBase} = generateDurationSeries(duration);

    const points = await client.query(`
      WITH seq AS (${durSeq})
      SELECT (CASE
                WHEN max(n.total_pledges_gb) IS NULL THEN 0
                ELSE coalesce(max(n.total_committed_gb), 0) / max(n.total_pledges_gb)::decimal END) AS amount,
             seq.date                                                                                   AS date
      FROM seq
             LEFT OUTER JOIN network_usage_stats n
               ON seq.date = extract(EPOCH FROM date_trunc('${durBase}', to_timestamp(n.calculated_at)))
      GROUP BY seq.date
      ORDER BY date ASC;
    `);

    return this.inflateTimeseriesDatapoints(points.rows);
  }

  private async getMiningDistributionOverTime (client: PoolClient) {
    const intervals = [1, 7, 30];
    const ret: CategoryDatapoint[] = [];

    for (const interval of intervals) {
      const res = await client.query(`
        SELECT b.miner AS address, (count(*)::decimal / (SELECT count(*) FROM blocks)) AS percentage
        FROM blocks b
        WHERE b.miner != ''
          AND b.ingested_at > extract(EPOCH FROM current_timestamp - INTERVAL '${interval} day')
        GROUP BY b.miner
        ORDER BY percentage DESC
        LIMIT 4;
      `);

      const category = `${interval} day${interval > 1 ? 's' : ''}`;
      if (!res.rows.length) {
        ret.push({
          category,
          data: {},
        });
      }

      const data: { [k: string]: BigNumber } = {};
      let accumulator = new BigNumber(0);
      for (const row of res.rows) {
        const minerNode = await this.nss.getMinerByAddress(row.address);
        const point = minerNode ? minerNode.nickname : row.address;
        const percentage = new BigNumber(row.percentage);
        data[point] = percentage;
        accumulator = accumulator.plus(row.percentage);
      }

      data['Other'] = new BigNumber(1).minus(accumulator);
      ret.push({
        category,
        data,
      });
    }

    return ret;
  }

  private async getMiningEvolution (client: PoolClient) {
    const topMinerRes = await client.query(`
      SELECT b.miner AS address, (count(*)::decimal / (SELECT count(*) FROM blocks)) AS percentage
      FROM blocks b
      WHERE b.miner != ''
        AND b.ingested_at > extract(EPOCH FROM current_timestamp - INTERVAL '30 day')
      GROUP BY b.miner
      ORDER BY percentage DESC
      LIMIT 9;
    `);

    if (!topMinerRes.rows.length) {
      return [];
    }

    const nodeMap: {[k:string]: string} = {};
    for (const miner of topMinerRes.rows) {
      const node = await this.nss.getMinerByAddress(miner.address);
      nodeMap[miner.address] = node ? node.nickname : miner.address
    }

    const addresses = topMinerRes.rows.map((r: any) => r.address);
    const topDailyCountsRes = await client.query(`
      with totals as (select count(*), extract(epoch from date_trunc('day', to_timestamp(b.ingested_at))) as date
                      from blocks b
                      group by date),
           counts as (select b.miner                                                            as address,
                             count(*)                                                           as count,
                             extract(epoch from date_trunc('day', to_timestamp(b.ingested_at))) as date
                      from blocks b
                      where b.miner = ANY($1::varchar[])
                      group by b.miner, date)
      select c.address, c.count::decimal / t.count as percentage, c.date
      from counts c
             join totals t on c.date = t.date
      order by c.date asc;
    `, [
      addresses
    ]);

    const otherDailyCountsRes = await client.query(`
      with totals as (select count(*), extract(epoch from date_trunc('day', to_timestamp(b.ingested_at))) as date
                      from blocks b
                      group by date),
           counts as (select b.miner                                                            as address,
                             count(*)                                                           as count,
                             extract(epoch from date_trunc('day', to_timestamp(b.ingested_at))) as date
                      from blocks b
                      where NOT (b.miner = ANY($1::varchar[]))
                      group by b.miner, date)
      select c.address, c.count::decimal / t.count as percentage, c.date
      from counts c
             join totals t on c.date = t.date
      order by c.date asc;
    `, [
      addresses
    ]);

    type CategoryDatapointData = { [k:string]: number }
    const generateData = () => addresses.reduce((acc: CategoryDatapointData, curr: string) => {
      acc[nodeMap[curr]] = 0;
      return acc
    }, { other: 0 });

    const points: CategoryDatapoint[] = [];
    for (const dailyCount of topDailyCountsRes.rows) {
      if (!points.length || points[points.length - 1].category !== Number(dailyCount.date)) {
        points.push({
          category: Number(dailyCount.date),
          data: generateData()
        });
      }

      const cat = points[points.length - 1];
      cat.data[nodeMap[dailyCount.address]] = new BigNumber(dailyCount.percentage);
    }

    let i = 0;
    for (const otherCount of otherDailyCountsRes.rows) {
      while (points[i].category !== Number(otherCount.date) && i < points.length) {
        i++;
      }

      if (i === points.length) {
        break;
      }

      points[i].data.other = new BigNumber(otherCount.percentage);
    }

    let date = Number(points[0].category);
    if (points.length < 28) {
      while (points.length < 28) {
        date = date - 86400;
        points.unshift({
          category: date,
          data: generateData()
        });
      }
    }

    return points;
  }

  private async getCostCapacityBySize(client: PoolClient, size: number, op: 'lt'|'gte'): Promise<CostCapacityForMinerStat> {
    const countCapRes = await client.query(`
      with capacities as (select m.from_address as address, sum(cast(m.params->>0 as decimal)) as gb
                          from messages m
                          where m.method = 'createMiner'
                          group by m.from_address)
      select count(c) as count, avg(c.gb) as capacity
      from capacities c
      where c.gb ${op === 'lt' ? '<' : '>='} $1; 
    `, [
      size,
    ]);

    if (!countCapRes.rows.length) {
      return {
        count: 0,
        averageStoragePrice: new BigNumber(0),
        averageCapacityGB: 0,
      };
    }

    const priceRes = await client.query(`
      with capacities as (select m.from_address as address, sum(cast(m.params->>0 as decimal)) as gb
                          from messages m
                          where m.method = 'createMiner'
                          group by m.from_address)
      select coalesce(avg(price), 0) as price
      from asks a
             join messages m on m.id = a.message_id
      where exists(select 1
                   from capacities c
                   where c.gb ${op === 'lt' ? '<' : '>='} $1
                     and c.address = m.from_address);
    `, [
      size
    ]);

    const price = priceRes.rows.length ? priceRes.rows[0].price : 0;
    return {
      count: Number(countCapRes.rows[0].count),
      averageCapacityGB: Number(countCapRes.rows[0].capacity),
      averageStoragePrice: new BigNumber(price),
    };
  }

  private inflateHistogramDatapoint (rows: any[]): HistogramDatapoint[] {
    return rows.map((r: any) => ({
      n: Number(r.n),
      bucketStart: new BigNumber(r.bucket_start),
      bucketEnd: new BigNumber(r.bucket_end),
      count: Number(r.count),
    }));
  }

  private inflateTimeseriesDatapoints (rows: any[]): TimeseriesDatapoint[] {
    return rows.map((r: any) => ({
      date: Number(r.date),
      amount: new BigNumber(r.amount),
    }));
  }

  private calculateTrend(points: TimeseriesDatapoint[]) : number {
    let trend;
    const ultimate = points[points.length - 1];
    const penultimate = points[points.length - 2];

    if (penultimate.amount.gt(0)) {
      const diff = ultimate.amount.minus(penultimate.amount);
      trend = diff.div(penultimate.amount).toNumber();
    } else {
      trend = ultimate.amount.gt(0) ? 1 : 0;
    }

    return trend;
  }
}