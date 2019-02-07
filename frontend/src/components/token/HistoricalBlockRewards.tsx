import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import TimelineDateChart from '../TimelineDateChart';
import GraphColors from '../GraphColors';
import Currency, {CurrencyNumberFormatter} from '../../utils/Currency';
import {OrderMagnitudeNumberFormatter} from '../../utils/OrderMagnitudeNumber';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import DateSwitchingChart from '../DateSwitchingChart';

export interface HistoricalBlockRewardsStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
  barData: TimeseriesDatapoint[]
  overrideBarData: TimeseriesDatapoint[]
}

export interface HistoricalBlockRewardsDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type HistoricalBlockRewardsProps = HistoricalBlockRewardsStateProps & HistoricalBlockRewardsDispatchProps;

export class HistoricalBlockRewards extends React.Component<HistoricalBlockRewardsProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    const summary = (
      <React.Fragment>
        {new Currency(this.props.data[this.props.data.length - 1].amount).toDisplay()}{' '}
        <small>FIL</small>
      </React.Fragment>
    );

    return (
      <TimelineDateChart
        label="Total Block Rewards Earned"
        summaryNumber={summary}
        data={isOverride ? this.props.overrideData : this.props.data}
        barData={isOverride ? this.props.overrideBarData : this.props.barData}
        lineColor={GraphColors.BLUE}
        barColor={GraphColors.ORANGE}
        yAxisLabels={['Cumulative Block Rewards Distributed', '# of Miners']}
        yAxisNumberFormatters={[new CurrencyNumberFormatter(true), new OrderMagnitudeNumberFormatter()]}
      />
    );
  };

  render () {
    return (
      <DateSwitchingChart
        title="Cumulative Block Rewards Over Time"
        onChangeDuration={this.onChangeDuration}
        renderContent={this.renderContent}
      />
    );
  }
}

function mapStateToProps (state: AppState): HistoricalBlockRewardsStateProps {
  return {
    data: state.stats.stats.token.blockRewardsOverTime,
    overrideData: state.overrides.token.historicalBlockRewards,
    barData: state.stats.stats.storage.historicalMinerCounts,
    overrideBarData: state.overrides.storage.historicalMinerCounts,
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalBlockRewardsDispatchProps {
  return {
    setOverride: async (dur: ChartDuration) => {
      await dispatch(setOverride('token', 'historicalBlockRewards', dur));
      await dispatch(setOverride('storage', 'historicalMinerCounts', dur));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalBlockRewards as any);