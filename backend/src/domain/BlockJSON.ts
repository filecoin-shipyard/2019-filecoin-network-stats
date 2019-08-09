import {MessageJSON} from './MessageJSON';

export interface RawBlockJSON {
    Header: RawHeader;

    Messages: MessageJSON[]|null;

    Receipts: any[]
}

export interface RawHeader {
  miner: string;

  ticket: string;

  parents: { '/': string }[];

  parentWeight: string;

  height: string;

  nonce: string;
    
  stateRoot: { [k: string]: string };

  messageReceipts: any;

  messages: any;

  proof: any[];    
}