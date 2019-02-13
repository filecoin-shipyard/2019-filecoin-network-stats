import BigNumber from 'bignumber.js';
import OrderMagnitudeNumber from './OrderMagnitudeNumber';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export function createCurrencyNumberFormatter (exampleValue: BigNumber): NumberFormatter {
  if (exampleValue.decimalPlaces() > 2 && exampleValue.lt(1) && exampleValue.gt(0)) {
    return new ScientificNumberFormatter();
  }

  return new CurrencyNumberFormatter(false);
}

export class ScientificNumberFormatter extends NumberFormatter {
  format (value: number | string, format?: string): string {
    const val = new BigNumber(value);
    return val.toExponential(1);
  }
}

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
  private readonly num: BigNumber;

  constructor (num: BigNumber) {
    this.num = num;
  }

  toOrderMagnitude (): string {
    return OrderMagnitudeNumber.smartSize(this.num, true);
  }

  toFullPrecision (): string {
    const places = this.num.decimalPlaces();
    return this.toDisplay(places === 0 ? 2 : places);
  }

  toDisplay (decimalPlaces: number = 2): string {
    const str = this.num.toFixed(decimalPlaces);
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
}