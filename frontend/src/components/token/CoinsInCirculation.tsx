import * as React from 'react';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import StackedColumnChart from '../StackedColumnChart';
import GraphColors from '../GraphColors';
import bemify from '../../utils/bemify';
import Currency, {CurrencyNumberFormatter} from '../../utils/Currency';
import DateSwitchingChart from '../DateSwitchingChart';
import {Dispatch} from 'redux';
import {setOverride} from '../../ducks/overrides';
import LabelledTooltip from '../LabelledTooltip';
import Tooltip from '../Tooltip';

const b = bemify('coins-in-circulation');

const categoryNames = {
  liquidCoins: 'Liquid Tokens',
  coinsInCollateral: 'Tokens in Collateral',
};


export interface CoinsInCirculationStateProps {
  data: CategoryDatapoint[]
  overrideData: CategoryDatapoint[]
}

export interface CoinsInCirculationDispatchProps {
  setOverride: (dur: ChartDuration) => any
}

export type CoinsInCirculationProps = CoinsInCirculationStateProps & CoinsInCirculationDispatchProps;

export class CoinsInCirculation extends React.Component<CoinsInCirculationProps> {
  onChangeDuration = async (dur: ChartDuration) => {
    return this.props.setOverride(dur);
  };

  renderContent = (isOverride: boolean) => {
    const latest = this.props.data[this.props.data.length - 1].data;
    const total = latest.liquidCoins.plus(latest.coinsInCollateral);

    const summary = (
      <React.Fragment>
        {new Currency(total).toDisplay()}{' '}
        <small>FIL</small>
      </React.Fragment>
    );

    return (
      <StackedColumnChart
        summaryNumber={summary}
        label="Total Tokens in Circulation"
        data={isOverride ? this.props.overrideData : this.props.data}
        isPercentage={false}
        categoryNames={categoryNames}
        yAxisLabels={['Total FIL in Circulation']}
        showBarLabels={false}
        colors={[GraphColors.BLUE, GraphColors.ORANGE]}
        yAxisNumberFormatters={[new CurrencyNumberFormatter(true)]}
        isDate
      />
    );
  };

  render () {
    return (
      <div className={b()}>
        <DateSwitchingChart
          title={this.renderTitle()}
          onChangeDuration={this.onChangeDuration}
          renderContent={this.renderContent}
        />
      </div>
    );
  }

  renderTitle () {
    const explainer = `Sum of all FIL outstanding on the network, including mining rewards and wallet balances, delineated by FIL that is pledged in storage collateral. Snapshots are taken every 5 minutes.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} bottom />} text="FIL Outstanding" />
    );
  }
}

function mapStateToProps (state: AppState): CoinsInCirculationStateProps {
  return {
    data: state.stats.stats.token.coinsInCirculation,
    overrideData: state.overrides.token.historicalCoinsInCirculation,
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): CoinsInCirculationDispatchProps {
  return {
    setOverride: (dur: ChartDuration) => dispatch(setOverride('token', 'historicalCoinsInCirculation', dur)),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(CoinsInCirculation as any);