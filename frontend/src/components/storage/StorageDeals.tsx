import * as React from 'react';
import bemify from '../../utils/bemify';
import {Col, Grid} from '../Grid';
import {SingleStat} from '../SingleStat';
import ContentHeader from '../ContentHeader';
import TimelineDateChart from '../TimelineDateChart';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import BigNumber from 'bignumber.js';
import HistogramChart from '../HistogramChart';
import Filesize from '../../utils/Filesize';
import Table from '../Table';
import ellipsify from '../../utils/ellipsify';
import PageHeader from '../PageHeader';
import {fakeEvolution, fakeSineWave} from '../../utils/randomData';
import GraphColors from '../GraphColors';
import PercentageLineChart from '../PercentageLineChart';
import TableHeaderWithUnit from '../TableHeaderWithUnit';
import SwitchableContent from '../SwitchableContent';

const b = bemify('storage-deals');

const durationHistogram: HistogramDatapoint[] = [
  {
    n: 1,
    bucketStart: new BigNumber(0),
    bucketEnd: new BigNumber(3),
    count: 500,
  },
  {
    n: 2,
    bucketStart: new BigNumber(4),
    bucketEnd: new BigNumber(6),
    count: 1000,
  },
  {
    n: 3,
    bucketStart: new BigNumber(7),
    bucketEnd: new BigNumber(9),
    count: 1500,
  },
  {
    n: 4,
    bucketStart: new BigNumber(10),
    bucketEnd: new BigNumber(12),
    count: 2000,
  },
  {
    n: 5,
    bucketStart: new BigNumber(13),
    bucketEnd: new BigNumber(15),
    count: 1750,
  },
  {
    n: 6,
    bucketStart: new BigNumber(16),
    bucketEnd: new BigNumber(-1),
    count: 1230,
  },
];

const sizeHistogram: HistogramDatapoint[] = [
  {
    n: 1,
    bucketStart: new BigNumber(0),
    bucketEnd: new BigNumber(10),
    count: 500,
  },
  {
    n: 2,
    bucketStart: new BigNumber(11),
    bucketEnd: new BigNumber(1000),
    count: 1000,
  },
  {
    n: 3,
    bucketStart: new BigNumber(1001),
    bucketEnd: new BigNumber(10000),
    count: 1500,
  },
  {
    n: 4,
    bucketStart: new BigNumber(10001),
    bucketEnd: new BigNumber(20000),
    count: 1250,
  },
  {
    n: 5,
    bucketStart: new BigNumber(20001),
    bucketEnd: new BigNumber(30000),
    count: 1100,
  },
  {
    n: 6,
    bucketStart: new BigNumber(30001),
    bucketEnd: new BigNumber(40000),
    count: 989,
  },
];

const dealActivity = [
  ['1.34 GB', '1 month', '1 FIL/GB/mo.', ellipsify('zDPWYqFD7X4ozU2kv5F5Wv6mbdjVh3gDFg5wLtwFm9mhF18z5V8K', 20), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)],
  ['1.34 GB', '1 month', '1 FIL/GB/mo.', ellipsify('zDPWYqFD7X4ozU2kv5F5Wv6mbdjVh3gDFg5wLtwFm9mhF18z5V8K', 20), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)],
  ['1.34 GB', '1 month', '1 FIL/GB/mo.', ellipsify('zDPWYqFD7X4ozU2kv5F5Wv6mbdjVh3gDFg5wLtwFm9mhF18z5V8K', 20), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)],
  ['1.34 GB', '1 month', '1 FIL/GB/mo.', ellipsify('zDPWYqFD7X4ozU2kv5F5Wv6mbdjVh3gDFg5wLtwFm9mhF18z5V8K', 20), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)],
  ['1.34 GB', '1 month', '1 FIL/GB/mo.', ellipsify('zDPWYqFD7X4ozU2kv5F5Wv6mbdjVh3gDFg5wLtwFm9mhF18z5V8K', 20), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15), ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)],
];

export default class StorageDeals extends React.Component {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Storage Deal Stats" />
        <Grid singleMargin>
          <Col unsupported>
            <SingleStat value="15,345" unit="" subtitle="Active Storage Deals" trend={15.67} />
          </Col>
          <Col unsupported>
            <SingleStat value="8,455" unit="" subtitle="Storage Deals Created in Last 24 Hrs" trend={-38.91} />
          </Col>
          <Col unsupported>
            <SingleStat value="97.8" unit="%" subtitle="% of storage deals completed" trend={12.4} />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <SwitchableContent
              titles={['Total Deals Over Time', 'Total FIL In Deals Over Time', 'Total Storage In Deals Over Time']}
              linkTitles={['# of deals over time', 'Amount of FIL in deals over time', 'Amount of GBs stored in deals over time']}
              dropdown
            >
              <React.Fragment>
                <TimelineDateChart
                  data={fakeSineWave()}
                  lineColor={GraphColors.GREY}
                  yAxisLabels={['Number of Deals']}
                />
              </React.Fragment>
              <React.Fragment>
                <TimelineDateChart
                  data={fakeSineWave()}
                  lineColor={GraphColors.GREY}
                  yAxisLabels={['Number of Deals']}
                />
              </React.Fragment>
              <React.Fragment>
                <TimelineDateChart
                  data={fakeSineWave()}
                  lineColor={GraphColors.GREY}
                  yAxisLabels={['Number of Deals']}
                />
              </React.Fragment>
            </SwitchableContent>
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Deal Size Distribution" />
            <PercentageLineChart
              data={fakeEvolution(['<10 TB', '10TB-1PB', '1PB-10PB', '>10PB'])}
              yAxisLabels={['% of All Deals']}
              greyscale
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Deal Duration" />
            <HistogramChart
              summaryNumber={<React.Fragment>9 <small>Months</small></React.Fragment>}
              label="Avg. Storage Deal Duration"
              data={durationHistogram}
              yAxisLabels={['Number of Deals']}
              dataTransformer={this.durationDataTransformer}
              showBarLabels
            />
          </Col>
          <Col unsupported>
            <ContentHeader title="Storage Deal Size" />
            <HistogramChart
              summaryNumber={<React.Fragment>7 <small>TB</small></React.Fragment>}
              label="Avg. Storage Deal Size"
              data={sizeHistogram}
              yAxisLabels={['Number of Deals']}
              dataTransformer={this.sizeDataTransformer}
              showBarLabels
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Current Deal Activity" />
            <Table
              headers={[
                <TableHeaderWithUnit label="Deal Size" unit="GB" />,
                <TableHeaderWithUnit label="Deal Duration" unit="Months" />,
                <TableHeaderWithUnit label="Storage Price" unit="FIL/GB/Month" />,
                'Price',
                'Content ID',
                'Miner Address',
                'Client Address',
              ]}
              rows={dealActivity}
            />
          </Col>
        </Grid>
      </div>
    );
  }

  durationDataTransformer (point: HistogramDatapoint) {
    const start = point.bucketStart.toString();
    const end = point.bucketEnd.toString();
    const label = point.bucketEnd.eq(-1) ? `${start}+ mo.` : `${start}-${end} mo.`;
    return {
      ...point,
      label,
      tooltipText: `Count: ${point.count}
${label}`,
    };
  }

  sizeDataTransformer (point: HistogramDatapoint) {
    const start = Filesize.fromGB(point.bucketStart).smartUnitString();
    const end = Filesize.fromGB(point.bucketEnd).smartUnitString();
    return {
      ...point,
      label: start,
      tooltipText: `Count: ${point.count}
${start} - ${end}`,
    };
  }
}