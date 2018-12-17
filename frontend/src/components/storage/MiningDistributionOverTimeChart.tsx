import * as React from 'react';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import StackedColumnChart from '../StackedColumnChart';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import ContentHeader from '../ContentHeader';

export interface MiningDistributionOverTimeChartProps {
  data: CategoryDatapoint[]
}

export class MiningDistributionOverTimeChart extends React.Component<MiningDistributionOverTimeChartProps> {
  render () {
    return (
      <div>
        <ContentHeader title="Mining Distribution Over Time" />
        <StackedColumnChart
          data={this.props.data}
          yAxisLabels={['% of Blocks Mined']}
        />
      </div>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.distributionOverTime,
  };
}

export default connect(
  mapStateToProps,
)(MiningDistributionOverTimeChart);