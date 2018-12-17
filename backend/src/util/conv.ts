import leb = require('leb128');
import BigNumber from 'bignumber.js';

export function leb128Base642Number (input: string): number {
  const buf = Buffer.from(input, 'base64');
  const decoded = leb.unsigned.decode(buf);
  return parseInt(decoded);
}

export function leb128UnsignedBase642Big (input: string): BigNumber {
  const buf = Buffer.from(input, 'base64');
  return leb128Unsigned2Big(buf);
}

export function leb128Unsigned2Big (buf: Buffer): BigNumber {
  const decoded = leb.unsigned.decode(buf);
  return new BigNumber(decoded);
}

export function leb128Unsigned2String(buf: Buffer): string {
  return leb.unsigned.decode(buf);
}