import * as React from 'react';
import bemify from '../utils/bemify';
import './NodeMap.scss';
import Map from './Map';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import {Node} from 'filecoin-network-stats-common/lib/domain/Node';
import * as am4maps from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import ContentHeader from './ContentHeader';
import ellipsify from '../utils/ellipsify';

const b = bemify('node-map');

export interface NodeMapStateProps {
  nodes: Node[] | null
}

export type NodeMapProps = NodeMapStateProps;

export class NodeMap extends React.Component<NodeMapProps> {
  private cityPoints: am4maps.MapImageSeries | null = null;

  render () {
    if (!this.props.nodes) {
      return null;
    }

    return (
      <div className={b()}>
        <ContentHeader title="Filecoin Node Activity and Distribution" />
        <div className={b('map')}>
          <div className={b('overlay')}>
            <div className={b('node-count')}>
              <h1>{this.props.nodes.length}</h1>
              Active Nodes
            </div>
          </div>
          <Map onData={this.onData} data={this.props.nodes} />
        </div>
      </div>
    );
  }

  onData = (nodes: Node[], chart: am4maps.MapChart) => {
    const nodeIndex: { [k: string]: Node[] } = {};
    for (const node of nodes) {
      const key = `${node.lat}-${node.long}`;
      if (nodeIndex[key]) {
        nodeIndex[key].push(node);
      } else {
        nodeIndex[key] = [node];
      }
    }

    type PointData = { lat: number, long: number, tooltipHTML: string, scale: number };
    if (!this.cityPoints) {
      this.cityPoints = chart.series.push(new am4maps.MapImageSeries());
      const template = this.cityPoints.mapImages.template;
      template.propertyFields.latitude = 'lat';
      template.propertyFields.longitude = 'long';
      template.propertyFields.tooltipHTML = 'tooltipHTML';
      template.propertyFields.scale = 'scale';
      const point = template.createChild(am4core.Circle);
      point.radius = 5;
      point.fill = am4core.color('#45b9e6');
      point.strokeWidth = 0;
      point.nonScaling = true;
    }

    const data: PointData[] = [];
    const className = b('nick-tooltip');
    for (const key of Object.keys(nodeIndex)) {
      const idxNodes = nodeIndex[key];
      const nodeCount = idxNodes.length;
      let nodeList = idxNodes.map((n: Node) => `<li>${escape(ellipsify(n.nickname || n.peerId, 20))}</li>`);
      if (nodeList.length > 9) {
        nodeList = nodeList.slice(0, 9);
        nodeList.push(`<li>... and ${nodeCount - 9} more ...</li>`);
      }
      data.push({
        lat: idxNodes[0].lat,
        long: idxNodes[0].long,
        scale: (1 + 3 * ((nodeCount) / nodes.length)),
        tooltipHTML: `
            <ul class="${className}">
                ${nodeList.join('')}
            </ul>
        `,
      });
    }
    setTimeout(() => {
      this.cityPoints.data = data;
    }, 0);
  };
}

const escapeDiv = document.createElement('div');

function escape (data: string) {
  escapeDiv.textContent = data;
  return escapeDiv.innerHTML;
}

function mapStateToProps (state: AppState) {
  return {
    nodes: state.stats.stats ? state.stats.stats.nodes : null,
  };
}

function mapDispatchToProps () {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeMap);