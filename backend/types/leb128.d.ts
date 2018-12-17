declare module 'leb128' {
  import Buffer = require('buffer');

  interface coder {
    encode (val: string): Buffer

    decode (val: Buffer): string
  }

  interface leb128 {
    signed: coder
    unsigned: coder
  }

  const leb: leb128;
  export = leb;
}