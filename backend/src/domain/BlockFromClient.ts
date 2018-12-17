import {Message} from './Message';

export interface BlockFromClient {
  miner: string

  ticket: string

  parents: {[k: string]: string}[]

  parentWeight: number

  height: number

  nonce: number

  stateRoot: {[k: string]: string}

  messageReceipts: any[]

  proof: any[]

  cid: string
}

export type BlockFromClientWithMessages = BlockFromClient & {
  messages: Message[]
}