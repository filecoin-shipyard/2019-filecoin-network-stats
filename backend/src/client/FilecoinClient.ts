import HTTPClient from './HTTPClient';
import {ChainClientImpl, IChainClient} from './ChainClient';
import {IMinerClient, MinerClientImpl} from './MinerClient';

export interface IFilecoinClient {
  chain (): IChainClient

  miner (): IMinerClient
}

export default class FilecoinClient implements IFilecoinClient {
  private readonly client: HTTPClient;

  private readonly chainClient: IChainClient;

  private readonly minerClient: IMinerClient;

  constructor (client: HTTPClient) {
    this.client = client;
    this.chainClient = new ChainClientImpl(this.client);
    this.minerClient = new MinerClientImpl(this.client);
  }

  chain (): IChainClient {
    return this.chainClient;
  }

  miner (): IMinerClient {
    return this.minerClient;
  }
}