import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import ContentHeader from '../ContentHeader';
import TimelineDateChart from '../TimelineDateChart';
import BigNumber from 'bignumber.js';
import GraphColors from '../GraphColors';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';

function decay(month: number) {
  return 1000 * Math.pow(2.71828, month * -0.0069270);
}

function genData (): TimeseriesDatapoint[] {
  const ret: TimeseriesDatapoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 192; i++) {
    ret.push({
      date: Math.floor((nowMs + (monthMs * i)) / 1000),
      amount: new BigNumber(decay(i)),
    });
  }

  return ret;
}

export default class BlockRewardLifecycle extends React.Component {
  render () {
    const summary = (
      <React.Fragment>
        1000.00{' '}
        <small>FIL</small>
      </React.Fragment>
    );

    return (
      <div>
        <ContentHeader title={this.renderTitle()} />
        <TimelineDateChart
          data={genData()}
          summaryNumber={summary}
          tooltip="{amount0.formatNumber('#,###.')} FIL"
          label="Current Block Reward"
          yAxisLabels={['Block Reward (FIL)']}
          lineColor={GraphColors.BLUE}
        />
      </div>
    );
  }

  renderTitle () {
    const explainer = `The expected block reward given the Filecoin whitepaper.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer}/>} text="Filecoin Network Block Rewards Curve" />
    );
  }
}