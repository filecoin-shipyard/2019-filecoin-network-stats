import * as request from 'request';
import * as querystring from 'querystring';
import {Config} from '../Config';
import makeLogger from '../util/logger';

export type StringMap = { [k: string]: string };
export type CurriedCall = <T> (method: string, args?: string[], options?: StringMap) => Promise<T>

const logger = makeLogger('HTTPClient');

export default class HTTPClient {
  private readonly url: string;

  constructor (config: Config) {
    this.url = config.fullNodeUrl;
  }

  callAPI = async <T> (service: string, method: string, args: string[] = [], options: StringMap = {}): Promise<T> => {
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

    return new Promise<T>((resolve, reject) => {
      request.post(url, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        if (res.statusCode !== 200) {
          logger.error('caught error response from Filecoin node', {
            data: res.body
          });
          return reject(new Error('non-200 status code'));
        }

        const lines = body.split('\n');
        try {
          const out: any[] = [];
          for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            if (!l) {
              continue;
            }

            out.push(JSON.parse(l));
          }

          resolve((out as any) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  forService = (service: string): CurriedCall => {
    return (method: string, args: string[] = [], options: StringMap = {}) => this.callAPI(service, method, args, options);
  };
}