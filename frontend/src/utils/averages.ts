import BigNumber from 'bignumber.js';
import { HistogramDatapoint } from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import { TimeseriesDatapoint } from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';

export function makeHistogramAverage(data: HistogramDatapoint[]): BigNumber {
  let total = new BigNumber(0);
  for (const point of data) {
    const count = point.count;
    const midpoint = point.bucketEnd.minus(point.bucketStart).div(2);
    total = total.plus(midpoint.times(count));
  }

  return total.div(data.length);
}

export function makeAverage(data: TimeseriesDatapoint[]): BigNumber {
  let total = new BigNumber(0);
  for (const point of data) {
    total = total.plus(point.amount);
  }

  return total.div(data.length);
}