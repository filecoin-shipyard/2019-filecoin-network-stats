import IService from './Service';
import {IChainsawDAO} from './dao/ChainsawDAO';
import {IFilecoinClient} from '../client/FilecoinClient';
import makeLogger from '../util/logger';
import {BlockFromClientWithMessages} from '../domain/BlockFromClient';
import MinerUpdater from '../client/MinerUpdater';
import {IMiningPowerService} from './MiningPowerService';

const logger = makeLogger('Chainsaw');

const POLL_INTERVAL = 15000;

export default class Chainsaw implements IService {
  private readonly cDao: IChainsawDAO;

  private readonly client: IFilecoinClient;

  private readonly mps: IMiningPowerService;

  private lastHeight: number = 0;

  private isPolling: boolean = false;

  constructor (cDao: IChainsawDAO, client: IFilecoinClient, mps: IMiningPowerService) {
    this.cDao = cDao;
    this.client = client;
    this.mps = mps;
  }

  async start (): Promise<void> {
    this.lastHeight = await this.cDao.lastBlock();
    this.isPolling = true;
    setImmediate(() => this.poll());
  }

  async stop (): Promise<void> {
    return undefined;
  }

  private async poll () {
    if (!this.isPolling) {
      return;
    }

    const start = Date.now();
    logger.silly('started poll');
    const allBlocks = await this.client.chain().ls();
    let unseenBlocks: BlockFromClientWithMessages[] = [];

    if (this.lastHeight > 0) {
      for (const block of allBlocks) {
        if (block.height === this.lastHeight) {
          break;
        }
        unseenBlocks.push(block);
      }
    } else {
      unseenBlocks = allBlocks;
    }

    if (!unseenBlocks.length) {
      logger.info('chainsaw found no new blocks to process, trying again later');
      this.enqueuePoll(start);
      return;
    }

    logger.silly('processing blocks', {
      count: unseenBlocks.length,
    });
    await this.processBlocks(unseenBlocks);

    this.lastHeight = unseenBlocks[0].height;
    logger.info('processed blocks', {
      height: this.lastHeight,
      count: unseenBlocks.length,
      topCid: unseenBlocks[0].cid,
      bottomCid: unseenBlocks[unseenBlocks.length - 1].cid,
    });

    this.enqueuePoll(start);
  }

  private enqueuePoll (start: number) {
    const now = Date.now();
    const elapsed = now - start;
    setTimeout(() => this.poll(), Math.max(POLL_INTERVAL - elapsed, 0));
  }

  private async processBlocks (blocks: BlockFromClientWithMessages[]) {
    const pledgeUpdater = new MinerUpdater(this.client.miner());
    for (const block of blocks) {
      for (const message of block.messages) {
        if (message.method === 'addAsk') {
          pledgeUpdater.addAddress(message.to);
        }
      }

      // genesis doesn't have a miner
      if (block.miner) {
        pledgeUpdater.addAddress(block.miner);
      } else {
        block.miner = 'bootstrap';
      }
    }

    const minerUpdates = await pledgeUpdater.update();
    await this.cDao.persistPoll(blocks, minerUpdates);
    await this.mps.updateMarketPower();
  }
}