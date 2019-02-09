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
import Tooltip from '../Tooltip';
import PowerTooltip from '../PowerTooltip';
import LabelledTooltip from '../LabelledTooltip';
import BaseDropdown from '../BaseDropdown';
import copy = require('copy-to-clipboard');

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
        return m1.height - m2.height;
      case 1:
        return m2.power - m1.power;
      case 2:
        return m2.capacity - m1.capacity;
      case 3:
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
          sortTitles={['Most Recent Block Mined', 'Storage Power', 'Storage Capacity', '% of Blocks Mined']}
          headers={['Node Name', 'Peer ID', this.renderTipsetHeader(), this.renderPowerHeader(), this.renderStorageCapacityHeader(), 'Block Height', this.renderLastBlockHeader(), this.renderPercentageBlocksMinedHeader()]}
          rowCount={this.props.miners.length}
          rows={this.props.miners.slice(start, end).filter(this.filter).sort(this.sort).map((m: MinerStat) => {
            return ([
              m.nickname,
              ellipsify(m.peerId, 12),
              this.renderBlocksInTipset(m),
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
    const explainer = 'When a tipset hash is highlighted, it means the corresponding node is in consensus with the rest of the network.';

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Blocks in Tipset" />
    );
  }

  renderPowerHeader () {
    return (
      <LabelledTooltip tooltip={<PowerTooltip />} text="Storage Power" />
    );
  }

  renderStorageCapacityHeader () {
    const explainer = `Storage Capacity represents the sum of the miner's pledged sectors.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Storage Capacity" />
    );
  }

  renderLastBlockHeader () {
    const explainer = `This is the last block seen by a particular miner.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Last Block" />
    );
  }

  renderPercentageBlocksMinedHeader () {
    const explainer = `This is the percentage of all historically emitted blocks mined by a particular miner.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="% of Blocks Mined" />
    );
  }

  renderBlocksInTipset (m: MinerStat) {
    return (
      <div className={b('blocks-in-tipset')}>
        <BaseDropdown title="1 block">
          <div className={b('parent-hashes')}>
            <div className={b('parent-hashes-header')}>
              Parent Hashes
            </div>
            <div className={b('tipset-hashes')}>
              {m.parentHashes.map((p: string) => (
                <div className={b('tipset-hash')} onClick={() => copy(p)}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </BaseDropdown>
      </div>
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