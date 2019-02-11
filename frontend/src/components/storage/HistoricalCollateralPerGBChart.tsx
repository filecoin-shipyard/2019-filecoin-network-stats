import * as React from 'react';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import TimelineDateChart from '../TimelineDateChart';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import GraphColors from '../GraphColors';
import Currency, {CurrencyNumberFormatter} from '../../utils/Currency';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';
import BigNumber from 'bignumber.js';

export interface HistoricalCollateralPerGBChartStateProps {
  data: TimeseriesDatapoint[]
  average: BigNumber
  overrideData: TimeseriesDatapoint[]
}

export interface HistoricalStoragePriceChartDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type HistoricalCollateralPerGBChartProps =
  HistoricalCollateralPerGBChartStateProps
  & HistoricalStoragePriceChartDispatchProps;

export class HistoricalCollateralPerGBChart extends React.Component<HistoricalCollateralPerGBChartProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    return (
      <TimelineDateChart
        lineColor={GraphColors.PURPLE}
        data={isOverride ? this.props.overrideData : this.props.data}
        summaryNumber={new Currency(this.props.average).toDisplay(2)}
        label={<LabelledTooltip tooltip={<Tooltip content="Averaged FIL divided by the number of pledged sectors for all pledges in the last 30 days."/>} text="Current Storage Collateral Per GB" />}
        tooltip="{amount0.formatNumber('#,###.00')} FIL/GB"
        yAxisLabels={['FIL/GB']}
        yAxisNumberFormatters={[new CurrencyNumberFormatter(true)]}
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
    const explainer = `Pledged FIL divided by the number of pledged sectors across all storage miners for the provided time period.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Storage Collateral Per GB" />
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.historicalCollateralPerGB.data,
    average: state.stats.stats.storage.historicalCollateralPerGB.average,
    overrideData: state.overrides.storage.historicalCollateralPerGB,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalStoragePriceChartDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalCollateralPerGB', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalCollateralPerGBChart as any);