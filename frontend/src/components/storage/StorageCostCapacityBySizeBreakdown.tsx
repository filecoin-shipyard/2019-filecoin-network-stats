import * as React from 'react';
import { CostCapacityForMinerStat } from 'filecoin-network-stats-common/lib/domain/CostCapacityForMinerStat';
import bemify from '../../utils/bemify';
import ContentHeader from '../ContentHeader';
import './StorageCostCapacityBySizeBreakdown.scss';
import {AppState} from '../../ducks/store';
import {connect} from 'react-redux';
import Filesize from '../../utils/Filesize';

const b = bemify('storage-cost-capacity-by-size-breakdown');

export interface StorageCostCapacityBySizeBreakdownProps {
  data: CostCapacityForMinerStat[]
}

export class StorageCostCapacityBySizeBreakdown extends React.Component<StorageCostCapacityBySizeBreakdownProps> {
  render () {
    return (
      <div className={b()}>
        <ContentHeader title="Storage Cost & Capacity by Miner Size" />
        <div className={b('split')}>
          {this.renderSide(0)}
          {this.renderSide(1)}
        </div>
      </div>
    );
  }

  renderSide (idx: 0|1) {
    const data = this.props.data[idx];

    return (
      <div className={b('split-child')}>
        <div className={b('split-header')}>
          {idx === 0 ? '<' : '>='} 10 PB Storage Capacity
        </div>
        <div className={b('split-stats')}>
          {this.renderStat(data.count.toString(), `Active Miner${data.count === 1 ? '' : 's'}`)}
          {this.renderStat(`${data.averageStoragePrice.div('1e18').toFixed(2)} FIL`, 'Avg. storage price')}
          {this.renderStat(Filesize.fromGB(data.averageCapacityGB).smartUnitString(), 'Avg. storage capacity/miner')}
        </div>
      </div>
    );
  }

  renderStat (value: string, label: string) {
    return (
      <div className={b('stat')}>
        <div className={b('stat-value')}>
          {value}
        </div>
        <div className={b('stat-label')}>
          {label}
        </div>
      </div>
    );
  }
}

function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.costCapacityBySize,
  };
}

export default connect(mapStateToProps)(StorageCostCapacityBySizeBreakdown);