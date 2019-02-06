import IService from './Service';
import makeLogger from '../util/logger';

const logger = makeLogger('MemoryCacheService');

export interface ICacheService extends IService {
  wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T>
}

export interface CacheEntry {
  value: any
  expiry: number
}

export class MemoryCacheService implements ICacheService {
  private cache: { [k: string]: CacheEntry } = {};

  // stub these for now in case we want to add redis later
  start (): Promise<void> {
    return;
  }

  stop (): Promise<void> {
    return;
  }

  async wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T> {
    const cached = this.cache[key];

    if (cached && cached.expiry >= Date.now()) {
      logger.silly('got cache hit', {key});
      return cached.value;
    }

    if (!cached || cached.expiry < Date.now()) {
      if (cached) {
        logger.silly('got expired cache entry, replacing', {key, expiry: cached.expiry});
      } else {
        logger.silly('got cache miss', {key});
      }

      const res = await m();
      this.cache[key] = {
        value: res,
        expiry: Date.now() + expiry,
      };
    }

    return this.cache[key].value as T;
  }
}