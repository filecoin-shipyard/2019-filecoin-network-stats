import * as request from 'request';
import * as querystring from 'querystring';
import {Config} from '../Config';
import makeLogger from '../util/logger';
import * as split2 from 'split2';

export type StringMap = { [k: string]: string };

export interface CurriedCall {
  callAPI<T> (method: string, args?: string[], options?: StringMap): Promise<T>

  callAPIStream<T> (method: string, args: string[], options: StringMap, onData: (d: T) => boolean, onError: (e: any) => void, onComplete: () => void): void
}

const logger = makeLogger('HTTPClient');

export default class HTTPClient {
  private readonly url: string;

  constructor (config: Config) {
    this.url = config.fullNodeUrl;
  }

  callAPIStream = <T> (service: string, method: string, args: string[] = [], options: StringMap = {}, onData: (d: T) => boolean, onError: (e: any) => void, onComplete: () => void) => {
    const argsQ = args.reduce((acc: string, curr: string) => {
      acc += `arg=${encodeURIComponent(curr)}`;
      return acc;
    }, '');
    const optsQ = querystring.stringify(options);
    let qs = argsQ;
    if (optsQ) {
      qs += `&${optsQ}`;
    }

    const url = `${this.url}/api/${service}/${method}${qs ? '?' + qs : ''}`;
    logger.silly('sending HTTP request to Filecoin node', {
      url,
    });

    // note that stream errors below don't propagate, so we need to
    // define them twice.
    let dataFinished = false;
    const handleError = (err: any) => {
      logger.error('got error in HTTP stream handler', {
        err,
      });
      if (!dataFinished) {
        onError(err);
        r.abort();
      }
    };
    const r = request.post(url, {
      gzip: true,
    }).on('complete', () => {
      if (!dataFinished) {
        onComplete();
      }
    }).on('error', handleError);

    r.pipe(split2(JSON.parse)).on('data', (data: T) => {
      const shouldFinishData = onData(data as T);
      if (!shouldFinishData) {
        dataFinished = true;
        onComplete();
        r.abort();
      }
    }).on('error', handleError);
  };

  callAPI = async <T> (service: string, method: string, args: string[] = [], options: StringMap = {}): Promise<T> => {
    const out: unknown[] = [];

    return new Promise<T>((resolve, reject) => {
      this.callAPIStream(service, method, args, options, (d) => {
        out.push(d);
        return true;
      }, (err: any) => {
        reject(err);
      }, () => resolve((out as unknown) as T));
    });
  };

  forService = (service: string): CurriedCall => {
    return {
      callAPI: (method, args, options) => this.callAPI(service, method, args, options),
      callAPIStream: (method, args, options, onData, onError, onComplete) => this.callAPIStream(service, method, args, options, onData, onError, onComplete),
    };
  };
}