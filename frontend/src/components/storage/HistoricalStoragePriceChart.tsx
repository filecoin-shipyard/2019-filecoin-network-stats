import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import TimelineDateChart from '../TimelineDateChart';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import Currency from '../../utils/Currency';

export interface HistoricalStoragePriceChartStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
}

export interface HistoricalStoragePriceChartDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type HistoricalStoragePriceChartProps = HistoricalStoragePriceChartStateProps & HistoricalStoragePriceChartDispatchProps

export class HistoricalStoragePriceChart extends React.Component<HistoricalStoragePriceChartProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    return (
      <TimelineDateChart
        data={isOverride ? this.props.overrideData : this.props.data}
        summaryNumber={new Currency(this.props.data[this.props.data.length - 1].amount).toOrderMagnitude()}
        label="Current Average Price of Storage"
      />
    );
  };

  render () {
    return (
      <div>
        <DateSwitchingChart
          title="Storage Price"
          onChangeDuration={this.onChangeDuration}
          renderContent={this.renderContent}
        />
      </div>
    );
  }
}

export function mapStateToProps (state: AppState): HistoricalStoragePriceChartStateProps {
  return {
    data: state.stats.stats.storage.storageCost.data,
    overrideData: state.overrides.storage.historicalStoragePrice,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalStoragePriceChartDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalStoragePrice', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalStoragePriceChart as any);