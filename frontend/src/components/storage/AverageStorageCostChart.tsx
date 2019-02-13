import * as React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import TimelineDateChart from '../TimelineDateChart';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import GraphColors from '../GraphColors';
import {makeAverage} from '../../utils/averages';
import Currency, {createCurrencyNumberFormatter, CurrencyNumberFormatter} from '../../utils/Currency';
import LabelledTooltip from '../LabelledTooltip';
import AveragePriceTooltip from '../AveragePriceTooltip';
import BigNumber from 'bignumber.js';
import Rollover from '../Rollover';
import {currencyTimeseriesRenderOpts} from '../../utils/timeseriesUnits';
import CurrencyWithTooltip from '../CurrencyWithTooltip';

export interface AverageStorageCostChartProps {
  data: TimeseriesDatapoint[]
  average: BigNumber
  overrideData: TimeseriesDatapoint[]
  overrideColor?: am4core.Color
  isOverride?: boolean
}

export class AverageStorageCostChart extends React.Component<AverageStorageCostChartProps> {
  render () {
    const summary = (
      <React.Fragment>
       <CurrencyWithTooltip amount={this.props.average}/>
        {' '}
        <small>FIL/GB/Month</small>
      </React.Fragment>
    );

    const data = this.props.isOverride ? this.props.overrideData : this.props.data;
    const { tooltipNum, numberFormatter } = currencyTimeseriesRenderOpts(data);

    return (
      <div>
        <TimelineDateChart
          data={this.props.isOverride ? this.props.overrideData : this.props.data}
          lineColor={this.props.overrideColor || GraphColors.GREEN}
          summaryNumber={summary}
          tooltip={`${tooltipNum} FIL/GB/Month`}
          label={<LabelledTooltip tooltip={<AveragePriceTooltip />} text="Current Avg. Price of Storage"/>}
          yAxisLabels={['Price (FIL)']}
          yAxisNumberFormatters={[numberFormatter]}
        />
      </div>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.storageCost.data,
    average: state.stats.stats.storage.storageCost.average,
    overrideData: state.overrides.storage.historicalStoragePrice,
  };
}

export default connect(mapStateToProps)(AverageStorageCostChart);