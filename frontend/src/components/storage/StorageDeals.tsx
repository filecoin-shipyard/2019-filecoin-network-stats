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
    bucketEnd: new BigNumber(20),
    count: 1000,
  },
  {
    n: 3,
    bucketStart: new BigNumber(21),
    bucketEnd: new BigNumber(30),
    count: 1500,
  },
  {
    n: 4,
    bucketStart: new BigNumber(31),
    bucketEnd: new BigNumber(40),
    count: 1250,
  },
  {
    n: 5,
    bucketStart: new BigNumber(41),
    bucketEnd: new BigNumber(50),
    count: 1100,
  },
  {
    n: 6,
    bucketStart: new BigNumber(51),
    bucketEnd: new BigNumber(-1),
    count: 989,
  },
];

const dealActivity = [
  ['-.-- GB', '- months', '-- FIL/GB/mo.', ellipsify('---------------------------------------------------', 20), ellipsify('----------------------------------------', 15), ellipsify('----------------------------------------', 15)],
  ['-.-- GB', '- months', '-- FIL/GB/mo.', ellipsify('---------------------------------------------------', 20), ellipsify('----------------------------------------', 15), ellipsify('----------------------------------------', 15)],
  ['-.-- GB', '- months', '-- FIL/GB/mo.', ellipsify('---------------------------------------------------', 20), ellipsify('----------------------------------------', 15), ellipsify('----------------------------------------', 15)],
  ['-.-- GB', '- months', '-- FIL/GB/mo.', ellipsify('---------------------------------------------------', 20), ellipsify('----------------------------------------', 15), ellipsify('----------------------------------------', 15)],
  ['-.-- GB', '- months', '-- FIL/GB/mo.', ellipsify('---------------------------------------------------', 20), ellipsify('----------------------------------------', 15), ellipsify('----------------------------------------', 15)],
];

export default class StorageDeals extends React.Component {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Storage Deals" />
        <Grid singleMargin>
          <Col unsupported>
            <SingleStat value="--" unit="" subtitle="Active Storage Deals" />
          </Col>
          <Col unsupported>
            <SingleStat value="--" unit="" subtitle="Storage Deals Created in Last 24 Hrs" />
          </Col>
          <Col unsupported>
            <SingleStat value="--" unit="" subtitle="% of Storage Deals Completed" />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <SwitchableContent
              titles={['Total Deals Over Time', 'Total FIL In Deals Over Time', 'Total Storage In Deals Over Time']}
              linkTitles={['# of Deals Over Time', 'Amount of FIL In Deals Over Time', 'Amount of GBs Stored in Deals Over Time']}
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
                  yAxisLabels={['FIL']}
                />
              </React.Fragment>
              <React.Fragment>
                <TimelineDateChart
                  data={fakeSineWave()}
                  lineColor={GraphColors.GREY}
                  yAxisLabels={['GB Stored In Deals']}
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
              noTooltip
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Deal Duration" />
            <HistogramChart
              summaryNumber={<React.Fragment>-- <small>Months</small></React.Fragment>}
              label="Avg. Storage Deal Duration"
              data={durationHistogram}
              yAxisLabels={['Number of Deals']}
              dataTransformer={this.durationDataTransformer}
              barColor={GraphColors.LIGHT_GREY}
              noTooltip
            />
          </Col>
          <Col unsupported>
            <ContentHeader title="Storage Deal Size" />
            <HistogramChart
              summaryNumber={<React.Fragment>-- <small>TB</small></React.Fragment>}
              label="Avg. Storage Deal Size"
              data={sizeHistogram}
              yAxisLabels={['Number of Deals']}
              dataTransformer={this.sizeDataTransformer}
              barColor={GraphColors.LIGHT_GREY}
              noTooltip
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Current Deal Activity" />
            <Table
              headers={[
                'Deal Size',
                'Deal Duration',
                'Storage Price',
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
    const label = point.bucketEnd.eq(-1) ? `${start}+ mo` : `${start}-${end} mo`;
    return {
      ...point,
      label,
      tooltipText: `Count: ${point.count}
${label}`,
    };
  }

  sizeDataTransformer (point: HistogramDatapoint) {
    let start = Filesize.fromGB(point.bucketStart).smartUnitString();
    let end = Filesize.fromGB(point.bucketEnd).smartUnitString();
    if (point.bucketEnd.eq(-1)) {
      start = `${Filesize.fromGB(point.bucketStart).smartUnit().size.toFixed(0)}+ GB`;
      end = '';
    } else {
      end = ` - ${end}`;
    }

    return {
      ...point,
      label: start,
      tooltipText: `Count: ${point.count}
${start}${end}`,
    };
  }
}