import BigNumber from 'bignumber.js';
import HTTPClient, {CurriedCall} from './HTTPClient';
import {MiningPower} from '../domain/MiningPower';

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
    const amount = await this.callAPI<string>('pledge', [address]);
    return new BigNumber(amount);
  }

  async power (address: string): Promise<MiningPower> {
    const [ power ] = await this.callAPI<[string]>('power', [address]);
    const splits = power.split('/').map((s) => s.trim());
    return {
      miner: Number(splits[0]),
      total: Number(splits[1]),
    };
  }
}