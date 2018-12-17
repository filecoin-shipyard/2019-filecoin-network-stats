import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import TimelineDateChart from '../TimelineDateChart';
import GraphColors from '../GraphColors';
import Currency, {CurrencyNumberFormatter} from '../../utils/Currency';
import {FilesizeNumberFormatter, SizeUnit} from '../../utils/Filesize';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import DateSwitchingChart from '../DateSwitchingChart';

export interface HistoricalCollateralChartStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
  barData: TimeseriesDatapoint[]
  overrideBarData: TimeseriesDatapoint[]
}

export interface HistoricalCollateralChartDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type HistoricalCollateralChartProps =
  HistoricalCollateralChartStateProps
  & HistoricalCollateralChartDispatchProps;

export class HistoricalCollateralChart extends React.Component<HistoricalCollateralChartProps> {
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
        label="Total FIL Held In Storage Collateral"
        summaryNumber={summary}
        data={isOverride ? this.props.overrideData : this.props.data}
        barData={isOverride ? this.props.overrideBarData : this.props.barData}
        lineColor={GraphColors.TURQUOISE}
        barColor={GraphColors.GREEN}
        yAxisLabels={['FIL', 'GB of Data Stored']}
        yAxisNumberFormatters={[new CurrencyNumberFormatter(true), new FilesizeNumberFormatter(SizeUnit.GB)]}
      />
    );
  };

  render () {
    return (
      <DateSwitchingChart
        title="Total Storage Collateral On Network"
        onChangeDuration={this.onChangeDuration}
        renderContent={this.renderContent}
      />
    );
  }
}

function mapStateToProps (state: AppState): HistoricalCollateralChartStateProps {
  return {
    data: state.stats.stats.storage.historicalCollateral,
    overrideData: state.overrides.storage.historicalCollateral,
    barData: state.stats.stats.storage.storageAmount.data,
    overrideBarData: state.overrides.storage.historicalStorageAmount,
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalCollateralChartDispatchProps {
  return {
    setOverride: async (dur: ChartDuration) => {
      await dispatch(setOverride('storage', 'historicalCollateral', dur));
      await dispatch(setOverride('storage', 'historicalStorageAmount', dur));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalCollateralChart as any);