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
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
  ['--------...--------', '-.-- GB', '--'],
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
            <SingleStat value="--" unit="" subtitle="Avg. Price of Retrieval" />
          </Col>
          <Col unsupported>
            <SingleStat value="--" unit="" subtitle="Avg. Retrieval Time / Miner" />
          </Col>
          <Col unsupported>
            <SingleStat value="--" unit="" subtitle="Avg. GB Retrieved Per Second" />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Total Retrieval Miners" />
            <TimelineDateChart
              data={nodesOverTime}
              summaryNumber="--"
              label="Retrieval Miners"
              yAxisLabels={['# of Miners']}
              tooltip="{amount0.formatNumber(#,###)} Miners"
              lineColor={GraphColors.GREY}
            />
          </Col>
        </Grid>
        <Grid>
          <Col unsupported>
            <ContentHeader title="Retrieval Asks Per Hour" />
            <TimelineDateChart
              data={nodesOverTime}
              summaryNumber="--"
              label="Current Avg. # of Retrieval Asks"
              tooltip="{amount0.formatNumber(#,###)} Asks/Hour"
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