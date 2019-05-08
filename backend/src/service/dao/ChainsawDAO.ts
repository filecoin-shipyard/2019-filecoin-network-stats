import PGClient from '../PGClient';
import {PoolClient} from 'pg';
import {ITimestampProvider} from '../TimestampProvider';
import {BlockFromClientWithMessages} from '../../domain/BlockFromClient';
import {MinerUpdate} from '../../domain/MinerUpdate';

export interface IChainsawDAO {
  lastBlock (): Promise<number>

  persistPoll (blocks: BlockFromClientWithMessages[], minerUpdates: MinerUpdate[]): Promise<void>
}

export default class PostgresChainsawDAO implements IChainsawDAO {
  private readonly client: PGClient;
  private readonly tsp: ITimestampProvider;

  constructor (client: PGClient, tsp: ITimestampProvider) {
    this.client = client;
    this.tsp = tsp;
  }

  lastBlock (): Promise<number> {
    return this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM blocks ORDER BY height DESC LIMIT 1',
      );

      if (!res.rows.length) {
        return 0;
      }

      return Number(res.rows[0].height);
    });
  }

  persistPoll (blocks: BlockFromClientWithMessages[], minerUpdates: MinerUpdate[]): Promise<void> {
    return this.client.executeTx(async (client: PoolClient) => {
      const lastId = await client.query('SELECT COALESCE(MAX(id), 0) FROM messages');

      for (const block of blocks) {
        const count = await client.query(
            `SELECT COUNT(*) AS count
             FROM blocks
             WHERE tipset_hash = $1`,
          [block.tipsetHash],
        );

        if (count.rows[0].count > 0) {
          continue;
        }

        await client.query(
          'INSERT INTO blocks(height, miner, parent_weight, nonce, ingested_at, parent_tipset_hashes, tipset_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            block.height,
            block.miner,
            block.parentWeight,
            block.nonce,
            this.tsp.now(),
            block.parents,
            block.tipsetHash,
          ],
        );

        for (const message of block.messages) {
          await client.query(
              `INSERT INTO messages (height,
                                     tipset_hash,
                                     tx_idx,
                                     gas_price,
                                     gas_limit,
                                     from_address,
                                     to_address,
                                     value,
                                     method,
                                     params,
                                     nonce)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              message.height,
              message.tipsetHash,
              message.index,
              message.gasPrice.toFixed(0),
              message.gasLimit.toFixed(0),
              message.from,
              message.to,
              message.value ? message.value.toFixed(0) : null,
              message.method,
              message.params ? JSON.stringify(message.params) : null,
              message.nonce,
            ],
          );
        }
      }

      for (const update of minerUpdates) {
        await client.query(
            `INSERT INTO miners (miner_address, amount, power, updated_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (miner_address) DO
               UPDATE SET (amount, power, updated_at) = ($2, $3, $4)`,
          [
            update.address,
            update.amount.toFixed(0),
            update.power.miner,
            this.tsp.now(),
          ],
        );
      }

      await client.query('SELECT populate_unique_messages($1)', [
        lastId.rows[0].id
      ]);
    });
  }
}