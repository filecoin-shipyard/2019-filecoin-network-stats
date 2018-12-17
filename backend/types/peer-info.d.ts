declare module 'peer-info' {
  interface IPeerInfoJSON {
    id: string
    privKey: string
    pubKey: string
  }

  interface IPeerID {
    toB58String (): string
  }

  interface IMultiaddrList {
    add (addr: string): void

    addSafe (addr: string): void

    delete (addr: string): void

    replace (existing: string, fresh: string): void
  }

  type PeerInfoCallback = (err: any, peerInfo: PeerInfo) => void

  class PeerInfo {
    static create (id: IPeerInfoJSON, cb: PeerInfoCallback): void

    id: IPeerID;

    multiaddrs: IMultiaddrList;
  }

  export = PeerInfo
}