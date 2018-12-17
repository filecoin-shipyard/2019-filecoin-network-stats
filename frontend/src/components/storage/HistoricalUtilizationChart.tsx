import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import TimelineDateChart from '../TimelineDateChart';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import GraphColors from '../GraphColors';
import PercentageNumber, {PercentageNumberFormatter} from '../../utils/PercentageNumber';
import {NumberFormatter} from '@amcharts/amcharts4/core';
import Tooltip from '../Tooltip';

export interface HistoricalUtilizationChartStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
  barData: TimeseriesDatapoint[]
  overrideBarData: TimeseriesDatapoint[]
}

export interface HistoricalUtilizationChartDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type HistoricalUtilizationChartProps =
  HistoricalUtilizationChartStateProps
  & HistoricalUtilizationChartDispatchProps

export class HistoricalUtilizationChart extends React.Component<HistoricalUtilizationChartProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    return (
      <TimelineDateChart
        lineColor={GraphColors.BLUE}
        data={isOverride ? this.props.overrideData : this.props.data}
        barData={isOverride ? this.props.overrideBarData : this.props.barData}
        yAxisLabels={['Current Utilization', '# of Miners']}
        summaryNumber={PercentageNumber.create(this.props.data[this.props.data.length - 1].amount).toDisplay(true)}
        yAxisNumberFormatters={[new PercentageNumberFormatter(), new NumberFormatter()]}
        label={this.renderTooltip()}
      />
    );
  };

  render () {
    return (
      <div>
        <DateSwitchingChart
          title="Network Utilization"
          onChangeDuration={this.onChangeDuration}
          renderContent={this.renderContent}
        />
      </div>
    );
  }

  renderTooltip () {
    const explainer = 'Utilization is calculated by dividing the number of committed sectors by the total number of pledged sectors.';

    return (
      <React.Fragment>
        Current Network Utilization <Tooltip content={explainer} />
      </React.Fragment>
    );
  }
}

export function mapStateToProps (state: AppState): HistoricalUtilizationChartStateProps {
  return {
    data: state.stats.stats.storage.networkUtilization,
    barData: state.stats.stats.storage.historicalMinerCounts,
    overrideData: state.overrides.storage.historicalUtilization,
    overrideBarData: state.overrides.storage.historicalMinerCounts,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalUtilizationChartDispatchProps {
  return {
    setOverride: async (dur: ChartDuration) => {
      await dispatch(setOverride('storage', 'historicalUtilization', dur));
      await dispatch(setOverride('storage', 'historicalMinerCounts', dur));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalUtilizationChart as any);