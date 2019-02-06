import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import {SingleStat} from './SingleStat';
import {ContentArea} from './ContentArea';
import MiningSummary from './MiningSummary';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import {MarketStats, StorageStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import Filesize, {SizeUnit} from '../utils/Filesize';
import NodeMap from './NodeMap';
import SwitchableContent from './SwitchableContent';
import PageHeader from './PageHeader';
import AverageStorageCostChart from './storage/AverageStorageCostChart';
import Currency, {CurrencyNumberFormatter} from '../utils/Currency';
import PercentageNumber from '../utils/PercentageNumber';
import GainLossTimelineChart from './GainLossTimelineChart';
import {makeAverage} from '../utils/averages';
import BigNumber from 'bignumber.js';
import Tooltip from './Tooltip';

const b = bemify('home');

export interface HomeStateProps {
  storageStats: StorageStats | null
  marketStats: MarketStats | null
}

export type HomeProps = HomeStateProps

export class Home extends React.Component<HomeProps, {}> {
  render () {
    const totalStorage = Filesize.fromGB(this.props.storageStats.storageAmount.total);
    const averageCost = new Currency(this.props.storageStats.storageCost.average);
    const averageVolume = makeAverage(this.props.marketStats.volume);
    const utilization = this.props.storageStats.networkUtilization;
    const currentUtilization = utilization[utilization.length - 1].amount;
    const utilizationTrend = (currentUtilization.gt(0) ? currentUtilization.minus(utilization[utilization.length - 2].amount)
      .div(currentUtilization) : new BigNumber(1)).multipliedBy(100);
    const summary = (
      <React.Fragment>
        {new Currency(averageVolume).toDisplay(2)}{' '}
        <small>FIL</small>
      </React.Fragment>
    );

    return (
      <div className={b()}>
        <ContentArea>
          <PageHeader title="Network Overview" />
          <Grid>
            <Col>
              <SingleStat
                value={averageCost.toDisplay(2)}
                unit="FIL/GB/mo."
                subtitle="Avg. Price of Storage"
                trend={PercentageNumber.create(this.props.storageStats.storageCost.trend).toNumber()}
                duration="24 hrs"
              />
            </Col>
            <Col>
              <SingleStat
                value={totalStorage.toString(SizeUnit.GB)}
                unit="GB"
                subtitle="Current Network Storage Capacity"
                trend={PercentageNumber.create(this.props.storageStats.storageAmount.trend).toNumber()}
                duration="24 hrs"
              />
            </Col>
            <Col>
              <SingleStat
                value={PercentageNumber.create(currentUtilization).toDisplay(false)}
                unit={'%'}
                trend={utilizationTrend.toNumber()}
                subtitle={'Current Network Utilization'}
                duration="24 hrs"
              />
            </Col>
            <Col unsupported>
              <SingleStat
                value="1"
                unit="FIL/GB"
                subtitle="Avg. Price of Retrieval"
                trend={1.23}
                duration="24 hrs"
              />
            </Col>
          </Grid>
          <Grid>
            <Col>
              <NodeMap />
            </Col>
          </Grid>
          <Grid>
            <Col>
              <SwitchableContent
                titles={['Avg. Price of Storage', 'Volume of FIL Transacted On-Chain']}
                linkTitles={['Storage Price', 'Token Volume']}
              >
                <AverageStorageCostChart />
                <GainLossTimelineChart
                  data={this.props.marketStats.volume}
                  yAxisLabels={['FIL']}
                  yAxisNumberFormatters={[new CurrencyNumberFormatter(true)]}
                  label={this.renderGainLossTimelineTooltip()}
                  summaryNumber={summary}
                />
              </SwitchableContent>
            </Col>
          </Grid>
          <Grid>
            <Col>
              <MiningSummary />
            </Col>
          </Grid>
        </ContentArea>
      </div>
    );
  }

  renderGainLossTimelineTooltip () {
    const explainer = 'Average daily volume is the sum of all FIL moving on-chain, minus block rewards. Red bars represent days where volume is less than the day before.';

    return (
      <React.Fragment>
        Avg. Daily Volume <Tooltip content={explainer} />
      </React.Fragment>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    storageStats: state.stats.stats ? state.stats.stats.storage : null,
    marketStats: state.stats.stats ? state.stats.stats.market : null,
  };
}

export default connect(mapStateToProps)(Home);