import BigNumber from 'bignumber.js';

export interface HistogramDatapoint {
  n: number
  bucketStart: BigNumber
  bucketEnd: BigNumber
  count: number
}

export interface HistogramDatapointJSON {
  n: number
  bucketStart: string
  bucketEnd: string
  count: number
}

export function histogramDatapointToJSON (dp: HistogramDatapoint): HistogramDatapointJSON {
  return {
    n: dp.n,
    bucketStart: dp.bucketStart.toString(),
    bucketEnd: dp.bucketEnd.toString(),
    count: dp.count,
  };
}

export function histogramDatapointFromJSON (dp: HistogramDatapointJSON) {
  return {
    n: dp.n,
    bucketStart: new BigNumber(dp.bucketStart),
    bucketEnd: new BigNumber(dp.bucketEnd),
    count: dp.count,
  };
}