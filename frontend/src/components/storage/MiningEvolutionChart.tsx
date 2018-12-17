import * as React from 'react';
import ContentHeader from '../ContentHeader';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import { CategoryDatapoint } from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import PercentageLineChart from '../PercentageLineChart';
import {PercentageNumberFormatter} from '../../utils/PercentageNumber';

export interface MiningEvolutionChartProps {
  evolution: CategoryDatapoint[]
}

export class MiningEvolutionChart extends React.Component<MiningEvolutionChartProps> {
  render () {
    return (
      <div>
        <ContentHeader title="Mining Evolution" />
        <PercentageLineChart
          data={this.props.evolution}
          yAxisLabels={['% of Blocks Mined']}
        />
      </div>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    evolution: state.stats.stats.storage.evolution,
  };
}

export default connect(
  mapStateToProps,
)(MiningEvolutionChart);