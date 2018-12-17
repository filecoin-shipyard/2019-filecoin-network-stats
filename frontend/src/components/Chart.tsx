import * as React from 'react';
import bemify from '../utils/bemify';
import './Chart.scss';
import c from 'classnames';
import * as am4core from '@amcharts/amcharts4/core';
import {NumberFormatter} from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import ChartRenderQueue from '../utils/ChartRenderQueue';

const b = bemify('fc-chart');

const queue = new ChartRenderQueue();

export interface BaseChartProps {
  summaryNumber?: React.ReactNode
  label?: React.ReactNode
  xAxisLabels?: string[]
  yAxisLabels?: string[]
  xAxisNumberFormatters?: NumberFormatter[]
  yAxisNumberFormatters?: NumberFormatter[]
  padding?: [number, number, number, number]
}

export interface ChartProps extends BaseChartProps {
  createChart: (id: string) => am4charts.Chart
  styleChart: (chart: am4charts.Chart) => void
}

export interface ChartState {
  isLoading: boolean
}

let id = 0;

export default class Chart extends React.Component<ChartProps, ChartState> {
  private readonly id: string;

  private chart: am4charts.Chart | null = null;

  static defaultProps = {
    padding: [24, 12, 12, 12],
    xAxisLabels: [] as string[],
    yAxisLabels: [] as string[],
    xAxisNumberFormatters: [] as NumberFormatter[],
    yAxisNumberFormatters: [] as NumberFormatter[],
  };

  constructor (props: ChartProps) {
    super(props);
    this.id = (++id).toString();

    this.state = {
      isLoading: true
    };
  }

  componentDidMount = () => queue.enqueueRender((done: () => void) => {
    this.chart = this.props.createChart(`chart-${this.id}`);
    const chart = this.chart;
    chart.paddingTop = this.props.padding[0];
    chart.paddingRight = this.props.padding[1];
    chart.paddingBottom = this.props.padding[2];
    chart.paddingLeft = this.props.padding[3];

    if (chart.legend) {
      chart.legend.fontSize = '12px';
      chart.legend.fontFamily = 'Open Sans, sans-serif';
      chart.legend.labels.template.stroke = am4core.color('#aaa');
    }

    if (chart instanceof am4charts.XYChart) {
      let i = 0;
      const styleAxes = (axis: am4charts.Axis) => {
        axis.renderer.grid.template.disabled = true;
        axis.fontSize = '12px';
        axis.fontFamily = 'Open Sans, sans-serif';
        axis.fontWeight = '400';
        axis.renderer.labels.template.stroke = am4core.color('#aaa');
        axis.renderer.minLabelPosition = 0.05;
        axis.title.stroke = am4core.color('#aaa');
        axis.title.fontSize = '12px';
        axis.title.fontFamily = 'Open Sans, sans-serif';
        i++;
      };

      chart.xAxes.each((axis: am4charts.Axis) => {
        axis.numberFormatter = this.props.xAxisNumberFormatters[i] || new NumberFormatter();
        axis.renderer.baseGrid.disabled = true;

        if (this.props.xAxisLabels[i]) {
          axis.title.text = this.props.xAxisLabels[i].toUpperCase();
        } else {
          axis.title.setVisibility(false);
        }

        styleAxes(axis);
      });

      i = 0;
      chart.yAxes.each((axis: am4charts.Axis) => {
        axis.numberFormatter = this.props.yAxisNumberFormatters[i] || new NumberFormatter();

        if (axis instanceof am4charts.ValueAxis) {
          axis.extraMax = 0.3;
        }

        if (this.props.yAxisLabels[i]) {
          axis.title.text = this.props.yAxisLabels[i].toUpperCase();
        } else {
          axis.title.setVisibility(false);
        }

        styleAxes(axis);
      });
    }

    this.props.styleChart(chart);
    chart.events.on('ready', () => {
      this.setState({
        isLoading: false
      });
      done();
    });
  });

  componentWillUnmount = () => queue.enqueueDispose((done: () => void) => {
    if (this.chart) {
      this.chart.events.on('beforedisposed', done);
      this.chart.dispose();
    } else {
      done();
    }
  });

  render () {
    const names = c(b('chart'), {
      [b('chart', 'no-header')]: !this.props.summaryNumber && !this.props.label,
    });

    return (
      <div className={b()}>
        <div className={b('chart-wrap')}>
          {this.renderLoading()}
          {this.renderHeader()}
          <div id={`chart-${this.id}`} className={names} />
        </div>
      </div>
    );
  }

  renderLoading () {
    if (!this.state.isLoading) {
      return null;
    }

    return (
      <div className={b('loading')}>
        <img src="/assets/loader.svg" />
      </div>
    );
  }

  renderHeader () {
    if (!this.props.summaryNumber && !this.props.label) {
      return null;
    }

    return (
      <div className={b('header')}>
        <div className={b('price')}>
          {this.props.summaryNumber}
        </div>
        <div className={b('label')}>
          {this.props.label}
        </div>
      </div>
    );
  }
}