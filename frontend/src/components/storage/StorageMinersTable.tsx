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
import ClickCopyable from '../ClickCopyable';
import PercentageNumber from '../../utils/PercentageNumber';
import * as c from 'classnames';

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
  private dropdowns: { [k: string]: BaseDropdown } = {};

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
        return m2.blockHeight - m1.blockHeight;
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
          title="Storage Mining Consensus Detail"
          onChangeFilter={this.onChangeQuery}
          onChangeSort={this.onChangeSort}
          onChangePage={this.onChangePage}
          downloadUrl={`${process.env.BACKEND_URL}/miners/csv`}
          filterPlaceholder="Search by Node Name, Peer ID, etc..."
          sortTitles={['Block Height', 'Storage Power', 'Proven Storage', '% of Blocks Mined']}
          headers={['Nickname', this.renderPeerIDHeader(), this.renderTipsetHeader(), this.renderPowerHeader(), this.renderStorageCapacityHeader(), 'Block Height', this.renderLastBlockHeader(), this.renderLastSeenHeader(), this.renderPercentageBlocksMinedHeader()]}
          rowCount={this.props.miners.length}
          rows={this.props.miners.filter(this.filter).sort(this.sort).slice(start, end).map((m: MinerStat) => {
            return ([
              ellipsify(m.nickname, 20),
              this.renderPeerID(m),
              this.renderBlocksInTipset(m),
              `${new BigNumber(m.power).multipliedBy(100).toFixed(2)}%`,
              Filesize.fromBytes(m.capacity).smartUnitString(),
              m.blockHeight,
              <FloatTimeago date={secToMillis(m.blockTime)} />,
              <FloatTimeago date={secToMillis(m.lastSeen)} />,
              PercentageNumber.create(m.blockPercentage).toDisplay(true),
            ]);
          })}
          keyGetter={(i) => this.props.miners[i].peerId}
        />
      </div>
    );
  }

  renderPeerID (m: MinerStat) {
    const names = c({
      [b('peer-id', 'consensus')]: m.isInConsensus,
    });

    return (
      <ClickCopyable copyData={m.peerId}>
        <span className={names}>
          {ellipsify(m.peerId, 12)}
        </span>
      </ClickCopyable>
    );
  }

  renderPeerIDHeader () {
    const explainer = `A highlighted Peer ID indicates the specific node is in consensus with the majority of nodes on the network.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Peer ID" />
    );
  }

  renderTipsetHeader () {
    const explainer = `List of blocks in the current best block's tipset. A tipset is a set of blocks at the same height that share the same parent set.`;

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
    const explainer = `Sum of committed sectors for each unique miner. Committed sectors are sectors that a miner has posted a Proof of Spacetime for.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Proven Storage" />
    );
  }

  renderLastBlockHeader () {
    const explainer = `Last block seen by each unique miner.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Last Block" />
    );
  }

  renderLastSeenHeader () {
    const explainer = `Last time each unique miner node heartbeat their IPs to the dashboard.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Last Seen" />
    );
  }

  renderPercentageBlocksMinedHeader () {
    const explainer = `Percentage of all blocks mined by a unique miner.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="% of Blocks Mined" />
    );
  }

  renderBlocksInTipset (m: MinerStat) {
    return (
      <div className={b('blocks-in-tipset')}>
        <BaseDropdown title={`${m.parentHashes.length} block${m.parentHashes.length !== 1 ? 's' : ''}`}
                      ref={(r) => (this.dropdowns[m.peerId] = r)}>
          <div className={b('parent-hashes')}>
            <div className={b('parent-hashes-header')}>
              Parent Hashes (Click to Copy)
            </div>
            <div className={b('tipset-hashes')}>
              {m.parentHashes.map((p: string) => (
                <div className={b('tipset-hash')} key={p}>
                  <ClickCopyable copyData={p}>
                    {p}
                  </ClickCopyable>
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