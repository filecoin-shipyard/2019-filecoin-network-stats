import IService from './Service';
import {IChainsawDAO} from './dao/ChainsawDAO';
import {IFilecoinClient} from '../client/FilecoinClient';
import makeLogger from '../util/logger';
import {BlockFromClientWithMessages} from '../domain/BlockFromClient';
import MinerUpdater from '../client/MinerUpdater';
import {IMiningPowerService} from './MiningPowerService';

const logger = makeLogger('Chainsaw');

const POLL_INTERVAL = 5000;

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

  async poll() {
    const start = Date.now();

    try {
      await this._doPoll();
    } catch (err) {
      logger.error('caught error during chainsaw run', {
        err,
      });
    } finally {
      this.enqueuePoll(start);
    }
  }

  async stop (): Promise<void> {
    this.isPolling = false;
  }

  private async _doPoll () {
    if (!this.isPolling) {
      return;
    }

    logger.silly('started poll');
    const unseenBlocks = await this.client.chain().ls(this.lastHeight);
    if (!unseenBlocks.length) {
      logger.info('chainsaw found no new blocks to process, trying again later');
      return;
    }

    logger.info('processing blocks', {
      count: unseenBlocks.length,
    });
    await this.processBlocks(unseenBlocks);

    // 0th element is top block
    this.lastHeight = unseenBlocks[0].height;
    logger.info('processed blocks', {
      height: this.lastHeight,
      count: unseenBlocks.length,
      top: unseenBlocks[0].height,
      bottom: unseenBlocks[unseenBlocks.length - 1].height,
    });
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
        // Some addAsk messages have 'empty' as the to_address
        if (message.method === 'addAsk' || message.method === 'commitSector' && message.to !== 'empty') {
          pledgeUpdater.addAddress(message.to);
        }
      }

      // genesis doesn't have a miner
      if (block.miner && block.miner !== 'empty') {
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