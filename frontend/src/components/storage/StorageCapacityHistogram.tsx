import * as React from 'react';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import {connect} from 'react-redux';
import {AppState} from '../../ducks/store';
import HistogramChart from '../HistogramChart';
import Filesize, {FilesizeNumberFormatter, SizeUnit} from '../../utils/Filesize';
import ContentHeader from '../ContentHeader';
import GraphColors from '../GraphColors';
import {OrderMagnitudeNumberFormatter} from '../../utils/OrderMagnitudeNumber';

export interface MinerCountChartProps {
  data: HistogramDatapoint[]
}

export class StorageCapacityHistogram extends React.Component<MinerCountChartProps> {
  render () {
    return (
      <div>
        <ContentHeader title="Storage Capacity Distribution" />
        <HistogramChart
          data={this.props.data}
          yAxisLabels={['Number of Miners']}
          dataTransformer={this.dataTransformer}
          barColor={GraphColors.DARK_GREEN}
          yAxisNumberFormatters={[new OrderMagnitudeNumberFormatter()]}
          xAxisLabels={['Avg. Storage Capacity/Miner']}
          highlightMax
        />
      </div>
    );
  }

  dataTransformer (point: HistogramDatapoint) {
    const start = new Filesize(point.bucketStart).smartUnit();
    let end = '+ TB';
    if (point.bucketEnd.gt(0)) {
      end = `${start.unit} - ${new Filesize(point.bucketEnd).smartUnitString()}`;
    }

    return {
      ...point,
      label: `${start}${end}`,
      tooltipText: `${point.count} Miners
${start}${end}`,
    };
  }
}

export function mapStateToProps (state: AppState) {
  return {
    data: state.stats.stats.storage.capacityHistogram,
  };
}

export default connect(mapStateToProps)(StorageCapacityHistogram);