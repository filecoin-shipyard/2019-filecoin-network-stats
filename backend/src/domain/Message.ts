import BigNumber from 'bignumber.js';

export interface Message {
  height: number

  tipsetHash: string

  index: number

  gasPrice: BigNumber

  gasLimit: BigNumber

  from: string

  to: string

  value: BigNumber|null

  method: string

  params: any|null
}