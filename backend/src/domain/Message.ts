import BigNumber from 'bignumber.js';

export interface Message {
  height: number

  index: number

  gasPrice: BigNumber

  gasLimit: BigNumber

  from: string

  to: string

  value: BigNumber|null

  method: string

  params: any|null
}