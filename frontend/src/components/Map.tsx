import * as React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import './AnimatedMap.scss';
import bemify from '../utils/bemify';

const b = bemify('animated-map');

export interface MapProps<T> {
  onData: (data: T, chart: am4maps.MapChart) => void
  data: T
}

export default class Map<T> extends React.Component<MapProps<T>, {}> {
  private chart: am4maps.MapChart | null = null;

  private mounted: boolean = false;

  private ref: HTMLElement|null = null;

  componentWillReceiveProps = (nextProps: MapProps<T>) => setTimeout(() => {
    this.props.onData(nextProps.data, this.chart);
  });

  componentDidMount = () => setTimeout(() => {
    this.mounted = true;
    am4core.useTheme(am4themes_animated);
    this.chart = am4core.create(this.ref, am4maps.MapChart);
    this.chart.geodata = am4geodata_worldLow;
    this.chart.projection = new am4maps.projections.Miller();
    this.chart.homeZoomLevel = 1.4;
    this.chart.mouseWheelBehavior = 'none';

    const polygonSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.fill = am4core.color('#daf1fa').lighten(0.4);
    polygonSeries.exclude = ['AQ'];

    this.props.onData(this.props.data, this.chart);
  }, 0);

  componentWillUnmount () {
    this.mounted = false;

    if (this.chart) {
      setTimeout(() => this.chart.dispose(), 0);
    }
  }

  render () {
    return (
      <div className={b('chart')} ref={(r: HTMLElement) => (this.ref = r)} />
    );
  }
}