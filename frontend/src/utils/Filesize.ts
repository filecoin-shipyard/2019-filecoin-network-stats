import BigNumber from 'bignumber.js';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export enum SizeUnit {
  KB = 1000,
  MB = 1,
  GB = -1000,
  TB = -1000000,
  PB = -1000000000
}

const UNITS_IN_ORDER = [
  SizeUnit.PB,
  SizeUnit.TB,
  SizeUnit.GB,
  SizeUnit.MB,
  SizeUnit.KB,
];

const UNITS_TO_STRINGS = {
  [SizeUnit.KB]: 'KB',
  [SizeUnit.MB]: 'MB',
  [SizeUnit.GB]: 'GB',
  [SizeUnit.TB]: 'TB',
  [SizeUnit.PB]: 'PB',
};

export class FilesizeNumberFormatter extends NumberFormatter {
  private readonly unit: SizeUnit;

  constructor (unit: SizeUnit) {
    super();
    this.unit = unit;
  }

  format (value: number | string, format?: string): string {
    let inst;
    switch (this.unit) {
      case SizeUnit.GB:
        inst = Filesize.fromGB(Number(value));
        break;
      case SizeUnit.MB:
      default:
        inst = Filesize.fromMB(Number(value));
        break;
    }
    return inst.smartUnitString();
  }
}

export default class Filesize {
  private readonly mb: BigNumber;

  constructor (mb: number | BigNumber) {
    this.mb = new BigNumber(mb);
  }

  toString (size: SizeUnit) {
    return this.toBigNumber(size).toFixed(0);
  }

  toBigNumber (size: SizeUnit) {
    return size < 0 ? this.mb.div(Math.abs(size)) : this.mb.times(size);
  }

  toUnitString(unit: SizeUnit) {
    return `${this.toUnit(unit)} ${UNITS_TO_STRINGS[unit]}`
  }

  toUnit(unit: SizeUnit) {
    const size = this.toBigNumber(unit);
    return `${size.toFixed(0)}`
  }

  smartUnit (): { size: BigNumber, unit: SizeUnit } {
    for (const unit of UNITS_IN_ORDER) {
      const size = this.toBigNumber(unit);
      if (size.gte(1)) {
        return {
          size,
          unit,
        };
      }
    }

    return {
      size: this.toBigNumber(SizeUnit.MB),
      unit: SizeUnit.MB,
    };
  }

  smartUnitString () {
    const smartUnit = this.smartUnit();
    return `${smartUnit.size.toFixed(0)} ${UNITS_TO_STRINGS[smartUnit.unit]}`;
  }

  static fromBytes(bytes: number|BigNumber) {
    return new Filesize(new BigNumber(bytes).dividedBy(1000000))
  }

  static fromGB (gb: number | BigNumber) {
    return new Filesize(new BigNumber(gb).times(1000));
  }

  static fromMB (mb: number | BigNumber) {
    return new Filesize(mb);
  }

  static fromTB (tb: number | BigNumber) {
    return this.fromGB(new BigNumber(tb).times(1000));
  }
}