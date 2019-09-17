import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {Block} from '../../domain/Block';
import {ICacheService} from '../CacheService';
import {synchronized} from '../../util/synchronized';
import makeLogger from '../../util/logger';

export interface IBlocksDAO {
  byHeight (height: number): Promise<Block | null>

  byHeights (heights: number[]): Promise<Block[]>

  top (forceRefresh?: boolean): Promise<Block | null>
}

const logger = makeLogger('PostgresBlocksDAO');

const TEN_MINUTES = 10 * 1000;

type NullSigil = 'NULL';
const NULL_SIGIL = 'NULL';

export class PostgresBlocksDAO implements IBlocksDAO {
  private readonly client: PGClient;

  private readonly cs: ICacheService;

  private topBlock: Block | null = null;

  constructor (client: PGClient, cs: ICacheService) {
    this.client = client;
    this.cs = cs;
  }

  async byHeight (height: number): Promise<Block | null> {
    const cached = this.cs.get<Block | NullSigil>(this.cacheKey(height));
    if (cached) {
      this.cs.setProactiveExpiry(this.cacheKey(height), TEN_MINUTES, cached);
      return cached === NULL_SIGIL ? null : cached;
    }

    return this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks WHERE height = $1',
        [
          height,
        ],
      );

      if (!res.rows.length) {
        this.cs.setProactiveExpiry(this.cacheKey(height), TEN_MINUTES, NULL_SIGIL);
        return null;
      }

      const block = this.inflateBlock(res.rows[0]);
      this.cs.setProactiveExpiry(this.cacheKey(block.height), TEN_MINUTES, block);
      return block;
    });
  }

  byHeights = synchronized(async (heights: number[]): Promise<Block[]> => {
    const cachedBlocks: Block[] = [];
    const uncachedBlocks: number[] = [];

    for (const height of heights) {
      const cached = this.cs.get<Block>(this.cacheKey(height));
      if (cached) {
        cachedBlocks.push(cached);
      } else {
        uncachedBlocks.push(height);
      }
    }

    if (uncachedBlocks.length === 0) {
      return cachedBlocks;
    }

    logger.info('populating uncached blocks', {
      count: uncachedBlocks.length,
      uncachedBlocks: uncachedBlocks,
    });

    let dbBlocks: Block[] = [];
    for (const height of uncachedBlocks) {
      const dbBlock = await this.byHeight(height);
      if (!dbBlock) {
        continue;
      }
      dbBlocks.push(dbBlock);
    }

    return cachedBlocks.concat(dbBlocks);
  });

  top = synchronized(async (forceRefresh: boolean = false): Promise<Block | null> => {
    if (this.topBlock && !forceRefresh) {
      return this.topBlock;
    }

    await this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks ORDER BY height DESC LIMIT 1',
      );

      if (!res.rows.length) {
        return null;
      }

      this.topBlock = this.inflateBlock(res.rows[0]);
    });


    return this.topBlock;
  });


  inflateBlock = (row: any): Block => {
    return {
      height: row.height,
      miner: row.miner,
      parentWeight: row.parent_weight,
      ingestedAt: row.ingested_at,
      parents: row.parent_tipset_hashes,
    };
  };

  private cacheKey (key: number | string): string {
    return `blocks-height-${key}`;
  }
}
