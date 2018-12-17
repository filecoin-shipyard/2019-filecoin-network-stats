declare module 'peer-id' {
  class PeerID {
    toB58String (): string

    static createFromBytes (buf: Buffer): PeerID
  }

  export = PeerID
}