import * as React from 'react';
import BigNumber from 'bignumber.js';
import Rollover from './Rollover';
import Currency from '../utils/Currency';

export interface CurrencyWithTooltipProps {
  amount: BigNumber
  unit?: string
}

export default class CurrencyWithTooltip extends React.Component<CurrencyWithTooltipProps> {
  static defaultProps = {
    unit: 'FIL'
  };

  render() {
    const amountCurrency = new Currency(this.props.amount);

    return (
      <Rollover content={`${amountCurrency.toFullPrecision()} ${this.props.unit}`}>
        {amountCurrency.toDisplay()}
      </Rollover>
    );
  }
}