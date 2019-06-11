import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {Block} from '../../domain/Block';
import {ICacheService} from '../CacheService';

export interface IBlocksDAO {
  byHeight (height: number): Promise<Block | null>

  byHeights (heights: number[]): Promise<Block[]>

  top (): Promise<Block | null>
}

const TEN_MINUTES = 10 * 1000;

export class PostgresBlocksDAO implements IBlocksDAO {
  private readonly client: PGClient;

  private readonly cs: ICacheService;

  constructor (client: PGClient, cs: ICacheService) {
    this.client = client;
    this.cs = cs;
    this.top = this.cs.wrapMethod('top-block', TEN_MINUTES, this.top);
  }

  async byHeight (height: number): Promise<Block | null> {
    const cached = this.cs.get<Block>(this.cacheKey(height));
    if (cached) {
      return cached;
    }

    return this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks WHERE height = $1',
        [
          height,
        ],
      );

      if (!res.rows.length) {
        return null;
      }

      const block = this.inflateBlock(res.rows[0]);
      this.cs.setProactiveExpiry(this.cacheKey(block.height), TEN_MINUTES, block);
      return block;
    });
  }

  byHeights (heights: number[]): Promise<Block[]> {
    return this.client.execute(async (client: PoolClient) => {
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

      const res = await client.query(
        'SELECT * FROM blocks WHERE height = ANY($1::bigint[])',
        [
          uncachedBlocks,
        ],
      );

      let dbBlocks: Block[] = [];
      if (res.rows.length) {
        dbBlocks = res.rows.map(this.inflateBlock);
        for (const block of dbBlocks) {
          this.cs.setProactiveExpiry(this.cacheKey(block.height), TEN_MINUTES, block);
        }
      }

      return cachedBlocks.concat(dbBlocks);
    });
  }

  async top (): Promise<Block | null> {
    const top = this.cs.get<Block>(this.cacheKey('top'));
    if (top) {
      return top;
    }

    
  }

  async refreshTop (): Promise<void> {
    await this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks ORDER BY height DESC LIMIT 1',
      );

      if (!res.rows.length) {
        return null;
      }

      this.cs.setProactiveExpiry(this.cacheKey('top'), TEN_MINUTES, this.inflateBlock(res.rows[0]));
    });
  }


  inflateBlock = (row: any): Block => {
    return {
      height: row.height,
      miner: row.miner,
      parentWeight: row.parent_weight,
      nonce: row.nonce,
      ingestedAt: row.ingested_at,
      parents: row.parent_tipset_hashes,
    };
  };

  private cacheKey (key: number | string): string {
    return `blocks-height-${key}`;
  }
}