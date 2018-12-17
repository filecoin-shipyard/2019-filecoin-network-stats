import PeerInfo = require('peer-info');
import * as fs from 'fs';
import {Config} from '../Config';

export async function providePeerInfo (config: Config): Promise<PeerInfo> {
  const buf = await new Promise<Buffer>((resolve, reject) => fs.readFile(config.peerInfoFile, (err: any, res: Buffer) => {
    if (err) {
      return reject(err);
    }

    resolve(res);
  }));

  const json = JSON.parse(buf.toString('utf-8'));

  return new Promise<PeerInfo>(((resolve, reject) => PeerInfo.create(json, (err: any, res: PeerInfo) => {
    if (err) {
      return reject(err);
    }

    res.multiaddrs.add(`/ip4/0.0.0.0/tcp/${config.heartbeatPort}`);
    resolve(res);
  })));
}