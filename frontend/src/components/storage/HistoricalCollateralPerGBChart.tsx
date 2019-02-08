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

export interface HistoricalCollateralPerGBChartStateProps {
  data: TimeseriesDatapoint[]
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
        summaryNumber={new Currency(this.props.data[this.props.data.length - 1].amount).toDisplay(2)}
        label="Current Storage Collateral Per GB"
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
    const explainer = `Calculated by dividing the collateralized FIL by the number of pledged sectors.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Storage Collateral Per GB" />
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.historicalCollateralPerGB,
    overrideData: state.overrides.storage.historicalCollateralPerGB,
  };
}

export function mapDispatchToProps (dispatch: Dispatch<any>): HistoricalStoragePriceChartDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('storage', 'historicalCollateralPerGB', dur)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalCollateralPerGBChart as any);