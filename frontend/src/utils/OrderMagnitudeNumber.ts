import BigNumber from 'bignumber.js';
import {NumberFormatter} from '@amcharts/amcharts4/core';

// note: using strings here to avoid putting ints
// in the SUFFIXES map. comparisons will work fine
// since they are performed using BigNumbers.
enum Sizes {
  THOUSAND = '1000',
  MILLION = '1000000',
  BILLION = '1000000000',
  TRILLION = '1000000000000'
}

type SuffixMap = { [k: string]: string };

const SUFFIXES = {
  [Sizes.THOUSAND]: 'K',
  [Sizes.MILLION]: 'M',
  [Sizes.BILLION]: 'B',
  [Sizes.TRILLION]: 'T',
  '': '',
} as SuffixMap;

export class OrderMagnitudeNumberFormatter extends NumberFormatter {
  format (value: number | string, format?: string): string {
    return OrderMagnitudeNumber.smartSize(new BigNumber(value), true);
  }
}

export default class OrderMagnitudeNumber {
  private readonly num: BigNumber;

  constructor (num: BigNumber) {
    this.num = num;
  }

  smartSize (showSuffix: boolean): string {
    let ret: string;
    let size: string;

    if (this.num.gte(Sizes.TRILLION)) {
      ret = this.num.div(Sizes.TRILLION).toFixed(1);
      size = Sizes.TRILLION;
    } else if (this.num.gte(Sizes.BILLION)) {
      ret = this.num.div(Sizes.BILLION).toFixed(1);
      size = Sizes.BILLION;
    } else if (this.num.gte(Sizes.MILLION)) {
      ret = this.num.div(Sizes.MILLION).toFixed(1);
      size = Sizes.MILLION;
    } else if (this.num.gte(Sizes.THOUSAND)) {
      ret = this.num.div(Sizes.THOUSAND).toFixed(1);
      size = Sizes.THOUSAND;
    } else {
      ret = this.num.toFixed(1);
      size = '';
    }

    return `${ret}${showSuffix ? SUFFIXES[size] : ''}`;
  }

  static smartSize (num: BigNumber, showSuffix: boolean): string {
    return new OrderMagnitudeNumber(num).smartSize(showSuffix);
  }
}