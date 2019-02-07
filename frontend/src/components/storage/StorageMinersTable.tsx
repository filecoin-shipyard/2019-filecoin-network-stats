import * as React from 'react';
import Table from '../Table';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import {MinerStat} from 'filecoin-network-stats-common/lib/domain/MinerStat';
import Filesize from '../../utils/Filesize';
import BigNumber from 'bignumber.js';
import ellipsify from '../../utils/ellipsify';
import FloatTimeago from '../FloatTimeago';
import {secToMillis} from '../../utils/time';
import bemify from '../../utils/bemify';
import './StorageMinersTable.scss';
import c from 'classnames';
import Tooltip from '../Tooltip';
import PowerTooltip from '../PowerTooltip';

const b = bemify('storage-miners-table');

export interface StorageMinersTableProps {
  miners: MinerStat[]
}

export interface StorageMinersTableState {
  query: string
  sortIndex: number
  currentPage: number
}

const FILTERABLE_FIELDS = [
  'nickname',
  'peerId',
];

export class StorageMinersTable extends React.Component<StorageMinersTableProps, StorageMinersTableState> {
  constructor (props: StorageMinersTableProps) {
    super(props);

    this.state = {
      query: '',
      currentPage: 1,
      sortIndex: 0,
    };
  }

  filter = (m: MinerStat) => {
    const query = this.state.query.toLowerCase();
    if (!query) {
      return true;
    }

    const mAny = m as any;
    for (const field of FILTERABLE_FIELDS) {
      if (mAny[field].toLowerCase().indexOf(query) > -1) {
        return true;
      }
    }

    return false;
  };

  sort = (m1: MinerStat, m2: MinerStat): number => {
    switch (this.state.sortIndex) {
      case 0:
        return 0;
      case 1:
        return m1.height - m2.height;
      case 2:
        return m2.power - m1.power;
      case 3:
        return m2.capacity - m1.capacity;
      case 4:
        return m2.blockPercentage - m1.blockPercentage;
    }
  };

  onChangeQuery = (query: string) => {
    this.setState({
      query,
    });
  };

  onChangeSort = (i: number) => {
    this.setState({
      sortIndex: i,
    });
  };

  onChangePage = (currentPage: number) => {
    this.setState({
      currentPage,
    });
  };

  render () {
    const start = (this.state.currentPage - 1) * 10;
    const end = start + 10;

    return (
      <div className={b()}>
        <Table
          title="Storage Mining Activity Detail"
          onChangeFilter={this.onChangeQuery}
          onChangeSort={this.onChangeSort}
          onChangePage={this.onChangePage}
          downloadUrl={`${process.env.BACKEND_URL}/miners/csv`}
          filterPlaceholder="Search by Node Name, Peer ID, etc..."
          sortTitles={['None', 'Block Height', 'Storage Power', 'Storage Capacity', '% of Blocks Mined']}
          headers={['Node Name', 'Peer ID', this.renderTipsetHeader(), this.renderPowerHeader(), 'Storage Capacity', 'Block Height', 'Time', 'Block %',]}
          rowCount={this.props.miners.length}
          rows={this.props.miners.slice(start, end).filter(this.filter).sort(this.sort).map((m: MinerStat) => {
            const tipsetNames = c(b('tipset-hash'), {
              [b('tipset-hash', 'consensus')]: m.isInConsensus,
            });

            return ([
              m.nickname,
              ellipsify(m.peerId, 15),
              <span className={tipsetNames}>{m.tipsetHash}</span>,
              `${new BigNumber(m.power).multipliedBy(100).toFixed(2)}%`,
              new Filesize(m.capacity).smartUnitString(),
              m.height,
              <FloatTimeago date={secToMillis(m.lastSeen)} />,
              `${Math.floor(m.blockPercentage * 100)}%`,
            ]);
          })}
          keyGetter={(i) => this.props.miners[i].peerId}
        />
      </div>
    );
  }

  renderTipsetHeader () {
    const explainer = 'When a tipset hash is highlighted, it is in consensus with the chain.';

    return (
      <React.Fragment>
        Tipset Hash <Tooltip content={explainer} />
      </React.Fragment>
    );
  }

  renderPowerHeader () {
    return (
      <React.Fragment>
        Storage Power <PowerTooltip />
      </React.Fragment>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    miners: state.stats.stats.storage.miners,
  };
}

export default connect(
  mapStateToProps,
)(StorageMinersTable);