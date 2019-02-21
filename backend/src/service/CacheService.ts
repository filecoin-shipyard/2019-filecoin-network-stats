import IService from './Service';
import makeLogger from '../util/logger';
import KeyedMutex from './KeyedMutex';

const logger = makeLogger('MemoryCacheService');

export interface ICacheService extends IService {
  wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T>
  setProactiveExpiry<T>(key: string, expiry: number, value: T): void
  get<T>(key: string): T|null
}

export interface CacheEntry {
  value: any
  expiry: number
}

export const DEFAULT_CACHE_TIME = 60 * 1000;

export class MemoryCacheService implements ICacheService {
  private cache: { [k: string]: CacheEntry } = {};

  private mutex: KeyedMutex;

  constructor () {
    this.mutex = new KeyedMutex();
  }

// stub these for now in case we want to add redis later
  start (): Promise<void> {
    return;
  }

  stop (): Promise<void> {
    return;
  }

  public setProactiveExpiry<T>(key: string, expiry: number, value: T) {
    this.cache[key] = {
      value: value,
      expiry: Date.now() + expiry
    };

    setTimeout(() => {
      if (this.cache[key] && this.cache[key].expiry < Date.now()) {
        delete this.cache[key];
      }
    }, expiry);
  }

  public get<T>(key: string): T|null {
    const val = this.cache[key];
    return val ? val.value : null;
  }

  async wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T> {
    const mtxKey = `cache-${key}`;
    if (this.mutex.isLocked(mtxKey)) {
      await this.mutex.block(mtxKey)
    }

    const cached = this.cache[key];

    if (cached && cached.expiry >= Date.now()) {
      logger.silly('got cache hit', {key});
      return cached.value;
    }

    const release = this.mutex.lock(mtxKey);
    try {
      if (!cached || cached.expiry < Date.now()) {
        if (cached) {
          logger.info('got expired cache entry, replacing', {key, expiry: cached.expiry});
        } else {
          logger.info('got cache miss', {key});
        }

        const res = await m();
        this.cache[key] = {
          value: res,
          expiry: Date.now() + expiry,
        };
      }
    } finally {
      release();
    }

    return this.cache[key].value as T;
  }
}