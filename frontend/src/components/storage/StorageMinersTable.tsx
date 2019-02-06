import * as React from 'react';
import {ChangeEvent} from 'react';
import Table from '../Table';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import {MinerStat} from 'filecoin-network-stats-common/lib/domain/MinerStat';
import Filesize from '../../utils/Filesize';
import BigNumber from 'bignumber.js';
import ellipsify from '../../utils/ellipsify';
import FloatTimeago from '../FloatTimeago';
import {secToMillis} from '../../utils/time';
import ContentHeader from '../ContentHeader';
import bemify from '../../utils/bemify';
import './StorageMinersTable.scss';
import c from 'classnames';
import Dropdown from '../Dropdown';
import debounce = require('lodash.debounce');
import Tooltip from '../Tooltip';

const b = bemify('storage-miners-table');

export interface StorageMinersTableProps {
  miners: MinerStat[]
}

export interface StorageMinersTableState {
  query: string
  enteredQuery: string
  sortIndex: number
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
      enteredQuery: '',
      sortIndex: 0
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

  onChangeQuery = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    this.setState({
      enteredQuery: query,
    });
    this.updateQuery(query);
  };

  onChangeSort = (i: number) => {
    this.setState({
      sortIndex: i
    });
  };

  updateQuery = debounce((query: string) => this.setState({
    query,
  }), 100);

  render () {
    return (
      <div className={b()}>
        <ContentHeader title="Storage Mining Activity Detail" />
        <div className={b('search-download')}>
          <div className={b('search')}>
            <input
              type="text"
              onChange={this.onChangeQuery}
              value={this.state.enteredQuery}
              placeholder="Search by Node Name, Peer ID, etc."
            />
          </div>
          <a className={b('download')} href={`${process.env.BACKEND_URL}/miners/csv`}>
            <img src="/assets/download.svg" alt="" /> Download
          </a>
          <div className={b('sort')}>
            Sort By:
            <Dropdown
              titles={['None', 'Block Height', 'Storage Power', 'Storage Capacity', '% of Blocks Mined']}
              onSwitch={this.onChangeSort}
            />
          </div>
        </div>
        <Table
          headers={['Node Name', 'Peer ID', this.renderTipsetHeader(), 'Storage Power', 'Capacity', 'Block %', 'Time']}
          rows={this.props.miners.filter(this.filter).sort(this.sort).map((m: MinerStat) => {
            const tipsetNames = c(b('tipset-hash'), {
              [b('tipset-hash', 'consensus')]: m.isInConsensus
            });

            return ([
              m.nickname,
              ellipsify(m.peerId, 15),
              <span className={tipsetNames}>{ellipsify(m.tipsetHash, 15)}</span>,
              `${new BigNumber(m.power).multipliedBy(100).toFixed(2)}%`,
              new Filesize(m.capacity).smartUnitString(),
              `${Math.floor(m.blockPercentage * 100)}%`,
              <FloatTimeago date={secToMillis(m.lastSeen)} />,
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
}

function mapStateToProps (state: AppState) {
  return {
    miners: state.stats.stats.storage.miners,
  };
}

export default connect(
  mapStateToProps,
)(StorageMinersTable);