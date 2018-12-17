import BigNumber from 'bignumber.js';

export interface CategoryDatapoint {
  category: string | number
  data: {
    [k: string]: BigNumber
  }
}

export interface CategoryDatapointJSON {
  category: string | number
  data: {
    [k: string]: string
  }
}

export function categoryDatapointToJSON (point: CategoryDatapoint): CategoryDatapointJSON {
  return {
    category: point.category,
    data: Object.keys(point.data).reduce((acc: { [k: string]: string }, k: string) => {
      acc[k] = point.data[k].toFixed(18);
      return acc;
    }, {}),
  };
}

export function categoryDatapointFromJSON (point: CategoryDatapointJSON): CategoryDatapoint {
  return {
    category: point.category,
    data: Object.keys(point.data).reduce((acc: { [k: string]: BigNumber }, k: string) => {
      acc[k] = new BigNumber(point.data[k]);
      return acc;
    }, {}),
  };
}