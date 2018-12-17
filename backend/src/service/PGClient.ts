import {Config} from '../Config';
import IService from './Service';
import {Pool, PoolClient} from 'pg';

export default class PGClient implements IService {
  private readonly config: Config;
  private pool: Pool | null = null;

  constructor (config: Config) {
    this.config = config;
  }

  async start (): Promise<void> {
    this.pool = new Pool({
      connectionString: this.config.dbUrl,
    });

    await this.pool.connect();
  }

  async stop (): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.end();
  }

  async execute<T> (cb: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      return cb(client);
    } finally {
      client.release();
    }
  }

  async executeTx<T> (cb: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const res = await cb(client);
      await client.query('COMMIT');
      return res;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}