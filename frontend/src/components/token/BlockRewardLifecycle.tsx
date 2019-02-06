import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/TimeseriesDatapoint';
import ContentHeader from '../ContentHeader';
import TimelineDateChart from '../TimelineDateChart';
import BigNumber from 'bignumber.js';
import GraphColors from '../GraphColors';

function genData (): TimeseriesDatapoint[] {
  const ret: TimeseriesDatapoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();
  const amount = new BigNumber(1000);
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 36; i++) {
    ret.push({
      date: Math.floor((nowMs + (monthMs * i)) / 1000),
      amount,
    });
  }

  return ret;
}

export default class BlockRewardLifecycle extends React.Component {
  render () {
    const summary = (
      <React.Fragment>
        1000{' '}
        <small>FIL</small>
      </React.Fragment>
    );

    return (
      <div>
        <ContentHeader title="Block Reward Lifecycle" />
        <TimelineDateChart
          data={genData()}
          summaryNumber={summary}
          label="Current Block Reward"
          yAxisLabels={['Block Reward (FIL)']}
          lineColor={GraphColors.BLUE}
        />
      </div>
    );
  }
}