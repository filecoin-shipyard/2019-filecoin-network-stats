import * as React from 'react';
import ContentHeader from '../ContentHeader';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import PercentageLineChart from '../PercentageLineChart';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';

export interface MiningEvolutionChartProps {
  evolution: CategoryDatapoint[]
}

export class MiningEvolutionChart extends React.Component<MiningEvolutionChartProps> {
  render () {
    return (
      <div>
        <ContentHeader title={this.renderTitle()} />
        <PercentageLineChart
          data={this.props.evolution}
          yAxisLabels={['% of Blocks Mined']}
        />
      </div>
    );
  }

  renderTitle () {
    const explainer = `Mining Evolution is calculated by finding the top 10 miners by blocks mined percentage over 30 days, and plotting how that percentage changes for those miners.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Mining Evolution (Last 30 Days)" />
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