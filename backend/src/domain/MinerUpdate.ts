import BigNumber from 'bignumber.js';
import {MiningPower} from './MiningPower';

export interface MinerUpdate {
  address: string
  amount: BigNumber
  power: MiningPower
}