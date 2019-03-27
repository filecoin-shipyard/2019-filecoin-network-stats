import {MessageJSON} from './MessageJSON';

export interface BlockJSON {
  miner: string;

  ticket: string;

  parents: { '/': string }[];

  parentWeight: string;

  height: string;

  nonce: string;

  messages: MessageJSON[]|null;

  stateRoot: { [k: string]: string };

  messageReceipts: any[];

  proof: any[];
}