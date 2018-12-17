import {IMinerClient} from './MinerClient';
import {MinerUpdate} from '../domain/MinerUpdate';

export default class MinerUpdater {
  private minerClient: IMinerClient;

  private addresses: { [k: string]: true } = {};

  constructor (minerClient: IMinerClient) {
    this.minerClient = minerClient;
  }

  public addAddress (address: string) {
    this.addresses[address] = true;
  }

  async update (): Promise<MinerUpdate[]> {
    const addresses = Object.keys(this.addresses);
    const ret = [];
    for (const address of addresses) {
      const amount = await this.minerClient.pledge(address);
      const power = await this.minerClient.power(address);
      ret.push({
        address,
        amount,
        power
      });
    }

    return ret;
  }
}