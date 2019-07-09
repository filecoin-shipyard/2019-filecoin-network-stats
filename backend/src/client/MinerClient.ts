import BigNumber from 'bignumber.js';
import HTTPClient, {CurriedCall} from './HTTPClient';
import {MiningPower} from '../domain/MiningPower';
import makeLogger from '../util/logger';
import {SECTOR_SIZE_GB} from '../Config';

const logger = makeLogger('MinerClient');

export interface IMinerClient {
  pledge (address: string): Promise<BigNumber>

  power (address: string): Promise<MiningPower>
}

export class MinerClientImpl implements IMinerClient {
  private readonly callAPI: CurriedCall['callAPI'];

  constructor (client: HTTPClient) {
    this.callAPI = client.forService('miner').callAPI;
  }

  async pledge (address: string): Promise<BigNumber> {
    return new BigNumber(1).multipliedBy(SECTOR_SIZE_GB);

    const amount = await this.callAPI<string>('pledge', [address]);
    logger.info('got pledge response', {
      amount,
      address,
    });

    return new BigNumber(amount).multipliedBy(SECTOR_SIZE_GB);
  }

  async power (address: string): Promise<MiningPower> {
    const [power] = await this.callAPI<[string]>('power', [address]);
    logger.info('got power response', {
      power,
      address,
    });

    if (typeof power === 'object') {
      logger.warn('failed to query miner power', {
        address,
        message: (power as any).Message
      });
      return {
        miner: 0,
        total: 1,
      };
    }

    const splits = power.split('/').map((s) => s.trim());
    return {
      miner: Number(splits[0]),
      total: Number(splits[1]),
    };
  }
}