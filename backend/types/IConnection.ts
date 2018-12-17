import PeerInfo = require('peer-info');
import {Multiaddr} from './Multiaddr';

export default interface IConnection {
  getPeerInfo(cb: (err: any, res: PeerInfo) => void): void
  getObservedAddrs (cb: (err: any, res: Multiaddr[]) => void): void
}