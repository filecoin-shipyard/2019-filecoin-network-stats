import HTTPClient, {CurriedCall} from './HTTPClient';
import {BlockJSON} from '../domain/BlockJSON';
import {leb128Base642Number, leb128UnsignedBase642Big} from '../util/conv';
import {BlockFromClientWithMessages} from '../domain/BlockFromClient';
import {MessageJSON} from '../domain/MessageJSON';
import {Message} from '../domain/Message';
import BigNumber from 'bignumber.js';
import {methodDecoders} from './ABI';

export interface IChainClient {
  ls (toBlock: number): Promise<BlockFromClientWithMessages[]>
}

export class ChainClientImpl implements IChainClient {
  private readonly callAPIStream: CurriedCall['callAPIStream'];

  constructor (client: HTTPClient) {
    this.callAPIStream = client.forService('chain').callAPIStream;
  }

  async ls (toBlock: number): Promise<BlockFromClientWithMessages[]> {
    const blockData: [BlockJSON][] = [];
    await new Promise((resolve, reject) => this.callAPIStream<[BlockJSON]>(
      'ls',
      [],
      {},
      (d: [BlockJSON]) => {
        if (leb128Base642Number(d[0].height) === toBlock) {
          return false;
        }

        blockData.push(d);
        return true;
      },
      (e: any) => {
        reject(e);
      },
      () => {
        resolve();
      }
    ));

    const out: BlockFromClientWithMessages[] = [];
    let lastCid = '';
    for (let i = 0; i < blockData.length; i++) {
      const json = blockData[i][0];

      // use parent CID for now until we can perform
      // CID generation client side or include it in
      // blocks via the API.
      if (i === 0) {
        lastCid = json.parents[0]['/'];
        continue;
      }

      const height = leb128Base642Number(json.height);
      out.push({
        miner: json.miner,
        ticket: json.ticket,
        parents: json.parents,
        parentWeight: leb128Base642Number(json.parentWeight),
        height,
        nonce: leb128Base642Number(json.nonce),
        stateRoot: json.stateRoot,
        messageReceipts: json.messageReceipts,
        proof: json.proof,
        cid: lastCid,
        messages: this.inflateMessages(json.messages, height),
      });

      const isGenesis = i === blockData.length - 1;
      if (!isGenesis && !json.parents) {
        throw new Error('block other than genesis without parents - implies bug');
      }

      if (!isGenesis) {
        lastCid = json.parents[0]['/'];
      }
    }
    return out;
  }

  private inflateMessages (messages: MessageJSON[] | null, height: number): Message[] {
    if (!messages) {
      return [];
    }

    return messages.map((wrapper: MessageJSON, i: number) => {
      const m = wrapper.meteredMessage;

      return {
        height,
        index: i,
        gasPrice: new BigNumber(m.gasPrice),
        gasLimit: leb128UnsignedBase642Big(m.gasLimit),
        from: m.message.from,
        to: m.message.to,
        value: m.message.value ? new BigNumber(m.message.value) : null,
        method: m.message.method,
        params: this.decodeParams(m.message.method, m.message.params),
      };
    });
  }

  private decodeParams (name: string, data: string): any {
    if (!data) {
      return null;
    }

    const decoder = methodDecoders[name];
    if (!decoder) {
      return data;
    }

    return decoder(data);
  }
}