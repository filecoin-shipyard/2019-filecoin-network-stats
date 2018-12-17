import IService from './Service';
import {IBlocksDAO} from './dao/BlocksDAO';
import {IMinerClient} from '../client/MinerClient';
import {IFilecoinClient} from '../client/FilecoinClient';

export interface IMiningPowerService extends IService {
  getMarketPower (): Promise<number>

  updateMarketPower (): Promise<void>

  getMinerPower (miner: string): Promise<number>
}

export class MiningPowerServiceImpl implements IMiningPowerService {
  private power: number = 1;

  private blockDao: IBlocksDAO;

  private minerClient: IMinerClient;

  constructor (blockDao: IBlocksDAO, client: IFilecoinClient) {
    this.blockDao = blockDao;
    this.minerClient = client.miner();
  }

  async start (): Promise<void> {
    let block = await this.blockDao.top();

    if (!block) {
      // let chainsaw catch up on first run
      block = await new Promise((resolve, reject) => setTimeout(() => this.blockDao.top().then(resolve).catch(reject), 30000));
    }

    if (!block) {
      throw new Error('No blocks found, cannot start mining power service.');
    }

    const power = await this.minerClient.power(block.miner);
    this.power = power.total;
  }

  async stop (): Promise<void> {
  }

  async getMarketPower (): Promise<number> {
    return this.power;
  }

  async updateMarketPower (): Promise<void> {
    const block = await this.blockDao.top();
    if (!block) {
      return;
    }

    const power = await this.minerClient.power(block.miner);
    this.power = power.total;
  }

  async getMinerPower(miner: string): Promise<number> {
    const power = await this.minerClient.power(miner);
    return power.miner / power.total;
  }
}