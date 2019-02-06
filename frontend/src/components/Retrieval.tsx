import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import {SingleStat} from './SingleStat';
import Table from './Table';
import ContentHeader from './ContentHeader';
import TimelineDateChart from './TimelineDateChart';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import BigNumber from 'bignumber.js';
import PageHeader from './PageHeader';
import GraphColors from './GraphColors';


const b = bemify('retrieval');

const rows: React.ReactNode[][] = [
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['2ac4dfc1...d5dcce16', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
  ['1e2037c3...fe0f427d', '3.47 GB', '24,790'],
];

const nodesOverTime: TimeseriesDatapoint[] = [];
const now = Date.now();
for (let i = 30; i >= 0; i--) {
  const date = Math.floor(((now / 1000) - i * 86400));
  const amount = Math.floor(30 - i + Math.abs(Math.sin(i) * 10));

  nodesOverTime.push({
    date,
    amount: new BigNumber(amount),
  });
}

export default class Retrieval extends React.Component<{}, {}> {
  render () {
    return (
      <div className={b()}>
        <PageHeader title="Retrieval Network Overview" />
        <Grid>
          <Col unsupported>
            <SingleStat value="1" unit="FIL/GB" subtitle="Avg. Price of Retrieval" trend={1.25} duration="24 hrs" />
          </Col>
          <Col unsupported>
            <SingleStat value="150" unit="ms" subtitle="Avg. Retrieval Time / Miner" trend={1.25} duration="24 hrs" />
          </Col>
          <Col unsupported>
            <SingleStat value="7" unit="GB/s" subtitle="Avg. GB Retrieved Per Second" trend={0.74} duration="24 hrs" />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Total Retrieval Miners" />
            <TimelineDateChart
              data={nodesOverTime}
              summaryNumber={nodesOverTime[0].amount.toString()}
              label="Retrieval Miners"
              yAxisLabels={['# of Miners']}
              lineColor={GraphColors.GREY}
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Retrieval Asks Per Hour" />
            <TimelineDateChart
              data={nodesOverTime}
              summaryNumber={nodesOverTime[0].amount.toString()}
              label="Current Avg. # of Retrieval Asks"
              yAxisLabels={['# of Bids']}
              lineColor={GraphColors.GREY}
            />
          </Col>
          <Col unsupported>
            <ContentHeader title="Top Files Retrieved on Network" />
            <Table headers={['Content ID', 'File Size', 'Times Retrieved']} rows={rows} />
          </Col>
        </Grid>
      </div>
    );
  }
}