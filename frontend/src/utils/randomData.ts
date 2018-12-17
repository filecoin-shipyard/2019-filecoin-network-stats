import BigNumber from 'bignumber.js';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';

export function fakeSineWave (): TimeseriesDatapoint[] {
  const ret: TimeseriesDatapoint[] = [];
  const now = Date.now();

  for (let i = 30; i >= 0; i--) {
    const date = Math.floor(((now / 1000) - i * 86400));
    const amount = Math.floor(30 - i + Math.abs(Math.sin(i) * 10));

    ret.push({
      date,
      amount: new BigNumber(amount),
    });
  }

  return ret;
}

export function fakeEvolution(labels: string[]): CategoryDatapoint[] {
  const ret: CategoryDatapoint[] = [];
  const now = Date.now();

  for (let i = 30; i >= 0; i--) {
    const date = Math.floor(((now / 1000) - i * 86400));
    const point: CategoryDatapoint = {
      category: date,
      data: {}
    };
    let acc = 0;
    for (let j = 0; j < labels.length; j++) {
      let num = Math.abs(Math.sin(i - j)) / 2;
      if (acc + num > 1) {
        num = 1 - acc;
      }
      acc += num;
      point.data[labels[j]] = new BigNumber(num)
    }
    ret.push(point);
  }

  return ret;
}