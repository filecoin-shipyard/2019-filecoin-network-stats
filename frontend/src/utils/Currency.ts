import BigNumber from 'bignumber.js';
import OrderMagnitudeNumber from './OrderMagnitudeNumber';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export class CurrencyNumberFormatter extends NumberFormatter {
  private readonly isOrderMagnitude: boolean;

  private readonly decimals: number;

  constructor (isOrderMagnitude: boolean, decimals: number = 2) {
    super();
    this.isOrderMagnitude = isOrderMagnitude;
    this.decimals = decimals;
  }

  format (value: number | string, format?: string): string {
    const currency = new Currency(new BigNumber(value));
    if (this.isOrderMagnitude) {
      return currency.toOrderMagnitude();
    }

    return currency.toDisplay(this.decimals);
  }
}

export default class Currency {
  private num: BigNumber;

  constructor (num: BigNumber) {
    this.num = num;
  }

  toOrderMagnitude (): string {
    return OrderMagnitudeNumber.smartSize(this.toBase(), true);
  }

  toDisplay (decimalPlaces: number = 2): string {
    const str = this.toBase().toFixed(decimalPlaces);
    const split = str.split('.');
    const intPart = split[0];
    let ret = '';
    for (let i = intPart.length - 1, j = 1; i >= 0; i--) {
      ret = `${intPart[i]}${ret}`;
      if (j % 3 === 0 && i !== 0) {
        ret = `,${ret}`;
      }

      j++;
    }

    return `${ret}${split[1] ? '.' + split[1] : ''}`;
  }

  toBase (): BigNumber {
    return this.num;
  }
}