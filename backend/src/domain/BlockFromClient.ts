import {Message} from './Message';

export interface BlockFromClient {
  miner: string

  tipsetHash: string

  parents: string[]

  height: number

  parentWeight: number

}

export type BlockFromClientWithMessages = BlockFromClient & {
  messages: Message[]
}