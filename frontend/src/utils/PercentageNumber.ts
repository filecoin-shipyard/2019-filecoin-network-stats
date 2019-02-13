import BigNumber from 'bignumber.js';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export class PercentageNumberFormatter extends NumberFormatter {
  format (value: number | string, format?: string): string {
    return PercentageNumber.create(value).toDisplay(true);
  }
}

export default class PercentageNumber {
  private readonly num: BigNumber;

  constructor (num: BigNumber) {
    this.num = num;
  }

  public toDisplay (showUnit: boolean): string {
    return `${this.num.multipliedBy(100).toFixed(1)}${showUnit ? '%' : ''}`;
  }

  public toNumber(): number {
    return Number(this.num.multipliedBy(100).toFixed(1));
  }

  static create (val: number | string | BigNumber): PercentageNumber {
    return new PercentageNumber(new BigNumber(val));
  }
}