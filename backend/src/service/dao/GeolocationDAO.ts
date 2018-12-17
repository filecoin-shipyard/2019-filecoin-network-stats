import PGClient from '../PGClient';
import {Location} from '../../domain/Location';
import {PoolClient} from 'pg';
import makeLogger from '../../util/logger';

const logger = makeLogger('GeolocationDAO');

export interface IGeolocationDAO {
  locateIp (ip: string): Promise<Location | null>
}

export class PostgresGeolocationDAO implements IGeolocationDAO {
  private readonly client: PGClient;

  constructor (client: PGClient) {
    this.client = client;
  }

  locateIp (ip: string): Promise<Location | null> {
    // TODO: remove on real server
    if (ip === '127.0.0.1') {
      ip = '208.82.98.123';
    }

    const intIp = this.ipToInt(ip);
    logger.silly('geolocating IP', {ip, intIp});
    return this.client.execute(async (client: PoolClient) => {
      const res = await client.query(
        'SELECT * FROM ip_to_locations WHERE ip_from >= $1 ORDER BY ip_to ASC LIMIT 1',
        [intIp],
      );

      if (!res.rows.length) {
        return null;
      }

      return {
        lat: res.rows[0].latitude,
        long: res.rows[0].longitude,
      };
    });
  }

  private ipToInt (ip: string): number {
    const splits = ip.split('.');
    let out = 0;
    for (let i = 0; i < splits.length; i++) {
      out += Number(splits[i]) * Math.pow(256, splits.length - 1 - i);
    }

    return out;
  }
}