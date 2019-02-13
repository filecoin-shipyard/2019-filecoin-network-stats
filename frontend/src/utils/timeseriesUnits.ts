import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import BigNumber from 'bignumber.js';
import {createCurrencyNumberFormatter} from './Currency';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export interface TimeseriesRenderOpts {
  tooltipNum: string
  numberFormatter: NumberFormatter
}

export function currencyTimeseriesRenderOpts (points: TimeseriesDatapoint[]): TimeseriesRenderOpts {
  const firstNonZero = points.find((d: TimeseriesDatapoint) => d.amount.gt(0));
  const chosenPoint = firstNonZero ? firstNonZero.amount : new BigNumber(0);
  const tooltipNum = chosenPoint.decimalPlaces() > 2 && chosenPoint.lt(1) ?
    `{amount0.formatNumber('#.#e')}` :
    `{amount0.formatNumber('#,###.00')}`;
  const numberFormatter = createCurrencyNumberFormatter(chosenPoint);

  return {
    tooltipNum,
    numberFormatter,
  };
}