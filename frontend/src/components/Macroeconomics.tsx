import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import PageHeader from './PageHeader';
import TokenHoldingsDistribution from './token/TokenHoldingsDistribution';
import HistoricalCollateralChart from './token/HistoricalCollateralChart';
import HistoricalBlockRewards from './token/HistoricalBlockRewards';
import {SingleStat} from './SingleStat';
import CoinsInCirculation from './token/CoinsInCirculation';

const b = bemify('macroeconomics');

export default class Macroeconomics extends React.Component<{}, {}> {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Token Metrics" />
        <Grid>
          <Col>
            <TokenHoldingsDistribution />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <CoinsInCirculation />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <HistoricalCollateralChart />
          </Col>
          <Col>
            <HistoricalBlockRewards />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <SingleStat value="1000" unit="FIL" subtitle="Current Block Reward" />
          </Col>
          <Col empty />
          <Col empty />
        </Grid>
      </div>
    );
  }
}