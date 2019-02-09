import * as React from 'react';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import ContentHeader from '../ContentHeader';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import HistogramChart from '../HistogramChart';
import OrderMagnitudeNumber, {OrderMagnitudeNumberFormatter} from '../../utils/OrderMagnitudeNumber';
import BigNumber from 'bignumber.js';
import Currency from '../../utils/Currency';
import {sum} from 'd3-array';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';

export interface TokenHoldingsDistributionProps {
  data: HistogramDatapoint[]
}

export class TokenHoldingsDistribution extends React.Component<TokenHoldingsDistributionProps> {
  render () {
    const summary = this.props.data.reduce((acc: number, curr: HistogramDatapoint) => {
      acc += curr.count;
      return acc;
    }, 0);

    return (
      <div>
        <ContentHeader title={this.renderTitle()} />
        <HistogramChart
          label="Token Addresses"
          summaryNumber={new Currency(new BigNumber(summary)).toDisplay(0)}
          data={this.props.data}
          dataTransformer={this.dataTransformer}
          yAxisLabels={['Amount of FIL in Each Address']}
          yAxisNumberFormatters={[new OrderMagnitudeNumberFormatter()]}
        />
      </div>
    );
  }

  dataTransformer (point: HistogramDatapoint) {
    const start = OrderMagnitudeNumber.smartSize(point.bucketStart, true);
    let end = 'FIL+';
    if (point.bucketEnd.gt(0)) {
      end = `FIL - ${OrderMagnitudeNumber.smartSize(point.bucketEnd, true)}FIL`
    }

    return {
      ...point,
      label: `${start}${end}`,
      tooltipText: `${point.count} Addresses
${start}${end}`,
    };
  }

  renderTitle () {
    const explainer = `This is the distribution of all token addresses, distributed into even buckets between the smallest balance and largest balances. Zero-balance addresses are excluded.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer}/>} text="Total FIL Token Addresses" />
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.token.tokenHoldingsDistribution,
  };
}

export default connect(mapStateToProps)(TokenHoldingsDistribution);