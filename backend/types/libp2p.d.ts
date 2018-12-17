declare module 'libp2p' {
  import PeerInfo = require('peer-info');

  interface Options {
    peerInfo: PeerInfo
    modules: {
      transport: any[],
      streamMuxer?: any[],
      connEncryption?: any[]
    },
    config?: {
      EXPERIMENTAL?: {
        pubsub?: boolean
      }
    }
  }

  type ErrCallback = (err: any) => void

  type HandlerFunc = (protocol: string, conn: any) => void

  class Node {
    constructor (options: Options)

    start (cb: ErrCallback): void

    stop (cb: ErrCallback): void

    on (event: string, cb: (data: any) => void): void

    handle (protocol: string, hdlr: HandlerFunc): void
  }

  export = Node;
}