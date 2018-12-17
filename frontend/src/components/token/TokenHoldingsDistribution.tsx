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
        <ContentHeader title="Total FIL Token Addresses" />
        <HistogramChart
          label="Token Addresses"
          summaryNumber={new Currency(new BigNumber(summary)).toDisplay()}
          data={this.props.data}
          dataTransformer={this.dataTransformer}
          yAxisLabels={['# of Token Addresses']}
          yAxisNumberFormatters={[new OrderMagnitudeNumberFormatter()]}
        />
      </div>
    );
  }

  dataTransformer (point: HistogramDatapoint) {
    const start = OrderMagnitudeNumber.smartSize(point.bucketStart, true);
    const end = OrderMagnitudeNumber.smartSize(point.bucketEnd, true);

    return {
      ...point,
      label: `${start}FIL`,
      tooltipText: `Count: ${point.count}
${start}FIL - ${end}FIL`,
    };
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.token.tokenHoldingsDistribution,
  };
}

export default connect(mapStateToProps)(TokenHoldingsDistribution);