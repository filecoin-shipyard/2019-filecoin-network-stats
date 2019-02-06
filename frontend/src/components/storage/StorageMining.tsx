import * as React from 'react';
import bemify from '../../utils/bemify';
import {Col, Grid} from '../Grid';
import MinerCountChart from './MinerCountChart';
import StorageMinersTable from './StorageMinersTable';
import PageHeader from '../PageHeader';
import MiningDistributionOverTimeChart from './MiningDistributionOverTimeChart';
import MiningEvolutionChart from './MiningEvolutionChart';

const b = bemify('storage-mining');

export default class StorageMining extends React.Component {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Storage Mining" />
        <Grid>
          <Col>
            <MinerCountChart />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <StorageMinersTable />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <MiningEvolutionChart />
          </Col>
        </Grid>
      </div>
    );
  }
}