import * as React from 'react';
import ContentHeader from '../ContentHeader';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import PercentageLineChart from '../PercentageLineChart';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';
import bemify from '../../utils/bemify';
import './MiningEvolutionChart.scss';

const b = bemify('mining-evolution-chart');

export interface MiningEvolutionChartProps {
  evolution: CategoryDatapoint[]
}

export class MiningEvolutionChart extends React.Component<MiningEvolutionChartProps> {
  render () {
    if (this.props.evolution.length < 2) {
      return (
        <div className={b()}>
          <ContentHeader title={this.renderTitle()} />
          <div className={b('empty')}>
            Heads-up! We don't have enough data yet to show this chart. Check back soon.
          </div>
        </div>
      );
    }

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
    const explainer = `Mining Evolution represents the % of blocks mined for the top 10 miners over the past 30 days.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Evolution of Top Miners (Last 30 Days)" />
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