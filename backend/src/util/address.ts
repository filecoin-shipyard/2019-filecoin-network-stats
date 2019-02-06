import blake2 = require('blake2');
import * as base32 from 'hi-base32';

export default function fromPubkey (buf: Buffer) {
  const hasher = blake2.createHash('blake2b', {digestLength: 20});
  hasher.update(buf);
  const hash: Buffer = hasher.digest();

  const combined = Buffer.concat([
    Buffer.from([0]),
    base32EncodeToBytes(hash),
  ]);
  const checksum = createChecksum('fc', combined);
  const toEncode = Buffer.concat([
    combined,
    checksum,
  ]);

  return `fc${base32EncodeCustomAlphabet(toEncode)}`;
}

const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod (buf: Buffer) {
  let chk = 1;
  let b: number;
  for (const byte of buf.values()) {
    b = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ byte;
    for (let i = 0; i < 5; i++) {
      if (((b >> i) & 1) === 1) {
        chk ^= generator[i];
      }
    }
  }

  return chk;
}

function hrpExpand (hrp: string): Buffer {
  const out = [];
  for (let i = 0; i < hrp.length; i++) {
    const code = hrp.charCodeAt(i);
    out.push(code >> 5);
  }

  out.push(0);

  for (let i = 0; i < hrp.length; i++) {
    const code = hrp.charCodeAt(i);
    out.push(code & 31);
  }

  return Buffer.from(out);
}

function createChecksum (hrp: string, data: Buffer) {
  const values = Buffer.concat([
    hrpExpand(hrp),
    data,
    Buffer.from([0, 0, 0, 0, 0, 0]),
  ]);
  const mod = polymod(values) ^ 1;
  const checksum = Buffer.alloc(6);
  for (let i = 0; i < checksum.length; i++) {
    checksum[i] = (mod >> (5 * (5 - i))) & 0x1f & 31;
  }
  return checksum;
}

const alphabetCustom = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const alphabetNormal = 'abcdefghijklmnopqrstuvwxyz234567';
const alphEnc: {[k:string]: number} = {};
const alphDec: {[k:number]: string} = {};
for (let i = 0; i < alphabetNormal.length; i++) {
  alphEnc[alphabetNormal[i]] = i;
}
for (let i = 0; i < alphabetCustom.length; i++) {
  alphDec[i] = alphabetCustom[i];
}

function base32EncodeToBytes(input: Buffer): Buffer {
  const encoded = base32.encode(input).toLowerCase();
  const out = [];
  for (const c of encoded) {
    out.push(alphEnc[c]);
  }
  return Buffer.from(out);
}

function base32EncodeCustomAlphabet(input: Buffer): string {
  const out = [];
  for (const value of input) {
    out.push(alphDec[value]);
  }
  return out.join('');
}