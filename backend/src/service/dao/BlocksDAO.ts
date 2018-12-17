import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {Block} from '../../domain/Block';

export interface IBlocksDAO {
  byHeight (height: number): Promise<Block | null>

  top (): Promise<Block | null>
}

export class PostgresBlocksDAO implements IBlocksDAO {
  private readonly client: PGClient;

  constructor (client: PGClient) {
    this.client = client;
  }

  byHeight (height: number): Promise<Block | null> {
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

      return this.inflateBlock(res.rows[0]);
    });
  }

  top (): Promise<Block | null> {
    return this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks ORDER BY height DESC LIMIT 1',
      );

      if (!res.rows.length) {
        return null;
      }

      return this.inflateBlock(res.rows[0]);
    });
  }


  inflateBlock (row: any): Block {
    return {
      height: row.height,
      cid: row.cid,
      miner: row.miner,
      parentWeight: row.parent_weight,
      nonce: row.nonce,
      ingestedAt: row.ingested_at,
    };
  }
}