import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import TimelineDateChart from '../TimelineDateChart';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import Currency, {CurrencyNumberFormatter} from '../../utils/Currency';
import BigNumber from 'bignumber.js';
import LabelledTooltip from '../LabelledTooltip';
import AveragePriceTooltip from '../AveragePriceTooltip';
import Tooltip from '../Tooltip';

export interface HistoricalStoragePriceChartStateProps {
  data: TimeseriesDatapoint[]
  overrideData: TimeseriesDatapoint[]
  average: BigNumber
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
        summaryNumber={new Currency(this.props.average).toDisplay()}
        yAxisNumberFormatters={[new CurrencyNumberFormatter(true)]}
        label="Current Avg. Price of Storage"
        yAxisLabels={['Price (FIL)']}
      />
    );
  };

  render () {
    return (
      <div>
        <DateSwitchingChart
          title={this.renderTitle()}
          onChangeDuration={this.onChangeDuration}
          renderContent={this.renderContent}
        />
      </div>
    );
  }

  renderTitle () {
    const explainer = `Storage price is calculated by averaging all outstanding storage asks every five minutes and aggregating them across the provided time window.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer}/>} text="Storage Price"/>
    );
  }
}

export function mapStateToProps (state: AppState): HistoricalStoragePriceChartStateProps {
  return {
    data: state.stats.stats.storage.storageCost.data,
    overrideData: state.overrides.storage.historicalStoragePrice,
    average: state.stats.stats.storage.storageCost.average,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalStoragePriceChartDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalStoragePrice', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalStoragePriceChart as any);