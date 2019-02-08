import * as React from 'react';
import bemify from '../../utils/bemify';
import {Col, Grid} from '../Grid';
import PageHeader from '../PageHeader';
import StorageCapacityHistogram from './StorageCapacityHistogram';
import HistoricalCollateralPerGBChart from './HistoricalCollateralPerGBChart';
import StorageCostCapacityBySizeBreakdown from './StorageCostCapacityBySizeBreakdown';
import HistoricalStoragePriceChart from './HistoricalStoragePriceChart';
import HistoricalUtilizationChart from './HistoricalUtilizationChart';

const b = bemify('storage-cost-capacity');

export default class StorageCostCapacity extends React.Component {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Storage Price & Capacity" />
        <Grid>
          <Col>
            <HistoricalStoragePriceChart />
          </Col>
          <Col>
            <HistoricalCollateralPerGBChart />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <StorageCostCapacityBySizeBreakdown />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <HistoricalUtilizationChart />
          </Col>
        </Grid>
        <Grid>
          <Col>
            <StorageCapacityHistogram />
          </Col>
        </Grid>
      </div>
    );
  }
}