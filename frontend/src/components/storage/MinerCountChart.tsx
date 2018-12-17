import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import TimelineDateChart from '../TimelineDateChart';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import {OrderMagnitudeNumberFormatter} from '../../utils/OrderMagnitudeNumber';

export interface MinerCountChartStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
}

export interface MinerCountChartDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type MinerCountChartProps = MinerCountChartStateProps & MinerCountChartDispatchProps

export class MinerCountChart extends React.Component<MinerCountChartProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    return (
      <TimelineDateChart
        data={isOverride ? this.props.overrideData : this.props.data}
        tooltipText="Miners: {amount}"
        summaryNumber={this.props.data[this.props.data.length - 1].amount.toFixed(0)}
        label="Current Active Storage Miners"
        yAxisLabels={['Number of Miners']}
        yAxisNumberFormatters={[new OrderMagnitudeNumberFormatter()]}
      />
    );
  };

  render () {
    return (
      <div>
        <DateSwitchingChart
          title="Total Storage Miners"
          onChangeDuration={this.onChangeDuration}
          renderContent={this.renderContent}
        />
      </div>
    );
  }
}

export function mapStateToProps (state: AppState): MinerCountChartStateProps {
  return {
    data: state.stats.stats.storage.historicalMinerCounts,
    overrideData: state.overrides.storage.historicalMinerCounts,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): MinerCountChartDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalMinerCounts', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MinerCountChart as any);