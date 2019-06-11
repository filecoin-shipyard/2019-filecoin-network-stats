import IService from './Service';
import makeLogger from '../util/logger';
import {synchronizedOn} from '../util/synchronized';

const logger = makeLogger('MemoryCacheService');

export interface ICacheService extends IService {
  wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T>

  setProactiveExpiry<T> (key: string, expiry: number, value: T): void

  get<T> (key: string): T | null

  set<T>(key: string, expiry: number, value: T)
}

export interface CacheEntry {
  value: any
  expiry: number
}

export const DEFAULT_CACHE_TIME = 60 * 1000;

export class MemoryCacheService implements ICacheService {
  private cache: { [k: string]: CacheEntry } = {};

// stub these for now in case we want to add redis later
  start (): Promise<void> {
    return;
  }

  stop (): Promise<void> {
    return;
  }

  public setProactiveExpiry<T> (key: string, expiry: number, value: T) {
    this.cache[key] = {
      value: value,
      expiry: Date.now() + expiry,
    };

    setTimeout(() => {
      if (this.cache[key] && this.cache[key].expiry < Date.now()) {
        delete this.cache[key];
      }
    }, expiry);
  }

  public get<T> (key: string): T | null {
    const val = this.cache[key];
    return val ? val.value : null;
  }

  public set<T>(key: string, expiry: number, value: T) {
    this.cache[key] = {
      value,
      expiry: Date.now() + expiry,
    };
  }

  async wrapMethod<T> (key: string, expiry: number, m: () => Promise<T>): Promise<T> {
    const mtxKey = `cache-${key}`;
    return this.executeWrappedMethod(mtxKey, key, expiry, m);
  }

  private executeWrappedMethod = synchronizedOn(async <T> (key: string, expiry: number, m: () => Promise<T>) => {
    const cached = this.cache[key];

    if (cached && cached.expiry >= Date.now()) {
      logger.silly('got cache hit', {key});
      return cached.value;
    }

    if (!cached || cached.expiry < Date.now()) {
      if (cached) {
        logger.info('got expired cache entry, replacing', {key, expiry: cached.expiry});
      } else {
        logger.info('got cache miss', {key});
      }

      const res = await m();
      this.set(key, res);
    }

    return this.cache[key].value as T;
  });
}
