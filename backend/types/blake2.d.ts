declare module 'blake2' {
  interface Blake2Hasher {
    update (buf: Buffer): void
    digest (): Buffer
  }

  interface Blake2Opts {
    digestLength: number
  }

  interface Blake2 {
    createHash (hash: 'blake2b', opts?: Blake2Opts): Blake2Hasher
  }

  const blk2: Blake2;

  export = blk2;
}