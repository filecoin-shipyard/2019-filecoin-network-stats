import BigNumber from 'bignumber.js';

export interface TimeseriesDatapoint {
  amount: BigNumber
  date: number
}

export interface TimeseriesDatapointJSON {
  amount: string
  date: number
}

export function timeseriesDatapointToJSON (point: TimeseriesDatapoint): TimeseriesDatapointJSON {
  return {
    amount: point.amount.toFixed(16),
    date: point.date,
  };
}

export function timeseriesDatapointFromJSON (point: TimeseriesDatapointJSON): TimeseriesDatapoint {
  return {
    amount: new BigNumber(point.amount),
    date: point.date,
  };
}