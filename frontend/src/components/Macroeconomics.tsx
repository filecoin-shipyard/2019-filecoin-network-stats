import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import PageHeader from './PageHeader';
import TokenHoldingsDistribution from './token/TokenHoldingsDistribution';
import HistoricalCollateralChart from './token/HistoricalCollateralChart';
import HistoricalBlockRewards from './token/HistoricalBlockRewards';
import CoinsInCirculation from './token/CoinsInCirculation';
import BlockRewardLifecycle from './token/BlockRewardLifecycle';

const b = bemify('macroeconomics');

export default class Macroeconomics extends React.Component<{}, {}> {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Token Metrics" />
        <Grid>
          <Col>
            <CoinsInCirculation />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <TokenHoldingsDistribution />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <HistoricalCollateralChart />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <HistoricalBlockRewards />
          </Col>
          <Col>
            <BlockRewardLifecycle />
          </Col>
        </Grid>
      </div>
    );
  }
}