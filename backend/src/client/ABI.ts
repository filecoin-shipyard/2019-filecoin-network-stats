import {leb128Unsigned2String} from '../util/conv';
import BigNumber from 'bignumber.js';
import fromPubkey from '../util/address';
import CBOR = require('cbor');
import PeerID = require('peer-id');

export interface TypeDecoder<T> {
  decode (buf: Buffer): T
}

export const AttoFilDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return leb128Unsigned2String(buf);
  },
};

export const BigIntDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return leb128Unsigned2String(buf);
  },
};

export const BytesDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return buf.toString('hex');
  },
};

export const PeerIDDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return PeerID.createFromBytes(buf).toB58String();
  },
};

export const SectorIDDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return new BigNumber(buf.toString('hex'), 16).toFixed(0);
  },
};

export const AddressDecoder: TypeDecoder<string> = {
  decode (buf: Buffer): string {
    return fromPubkey(buf);
  },
};

export class ABIDecoder {
  private readonly decoders: TypeDecoder<any>[];

  private readonly data: Buffer;

  constructor (decoders: TypeDecoder<any>[], data: Buffer) {
    this.decoders = decoders;
    this.data = data;
  }

  public decode (): any[] {
    const chunks = CBOR.decode(this.data) as Buffer[];

    if (chunks.length !== this.decoders.length) {
      throw new Error('number of decoders must equal number of components');
    }

    const out = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const dec = this.decoders[i];
      out.push(dec.decode(chunk));
    }

    return out;
  }

  static decodeBase64 (decoders: TypeDecoder<any>[], data: string): any[] {
    const buf = Buffer.from(data, 'base64');
    return new ABIDecoder(decoders, buf).decode();
  }
}

export const methodDecoders: { [k: string]: (data: string) => any } = {
  addAsk: (data: string) => ABIDecoder.decodeBase64([AttoFilDecoder, BigIntDecoder], data),
  createMiner: (data: string) => ABIDecoder.decodeBase64([BigIntDecoder, AddressDecoder, PeerIDDecoder], data),
  commitSector: (data: string) => ABIDecoder.decodeBase64([SectorIDDecoder, BytesDecoder, BytesDecoder, BytesDecoder, BytesDecoder], data),
};