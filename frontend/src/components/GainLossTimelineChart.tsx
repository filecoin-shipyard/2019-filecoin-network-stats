import * as React from 'react';
import bemify from '../utils/bemify';
import Chart, {BaseChartProps} from './Chart';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import GraphColors from './GraphColors';

const b = bemify('gain-loss-timeline-chart');

export interface GainLossTimelineChartProps extends BaseChartProps {
  data: TimeseriesDatapoint[]
  datapointProcessor?: (point: TimeseriesDatapoint) => TimeseriesDatapoint,
  tooltipText?: string
}

export default class GainLossTimelineChart extends React.Component<GainLossTimelineChartProps, {}> {
  static defaultProps = {
    tooltipText: '{amount}',
    datapointProcessor: (p: TimeseriesDatapoint) => p,
  };

  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);
    const legend = new am4charts.Legend();
    legend.parent = chart.tooltipContainer;
    legend.data = [{
      name: 'Daily Volume Increase',
      fill: GraphColors.GREEN,
    }, {
      name: 'Daily Volume Decrease',
      fill: GraphColors.RED,
    }];
    legend.fontSize = '12px';
    legend.fontFamily = 'Open Sans, sans-serif';
    legend.labels.template.stroke = am4core.color('#aaa');
    legend.position = 'absolute';
    legend.y = 8;
    legend.x = 100;
    legend.contentAlign = 'left';
    const template = legend.markers.template;
    template.width = 16;
    template.height = 16;

    chart.data = this.props.data.map((point: TimeseriesDatapoint, i: number) => {
      const processed = this.props.datapointProcessor(point);
      const prev = this.props.data[i - 1];
      return {
        amount: processed.amount.toString(),
        date: processed.date * 1000,
        color: prev && prev.amount.gt(point.amount) ? GraphColors.RED : GraphColors.GREEN,
      };
    });

    const xAxis = chart.xAxes.push(new am4charts.DateAxis());
    xAxis.dateFormatter = new am4core.DateFormatter();

    const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.renderer.labels.template.dx = .5;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.disabled = true;
    chart.cursor.lineY.disabled = true;

    return chart;
  };

  styleChart = (chart: am4charts.XYChart) => {
    const valueSeries = chart.series.push(new am4charts.ColumnSeries());
    valueSeries.dataFields.dateX = 'date';
    valueSeries.dataFields.valueY = 'amount';
    valueSeries.tooltipText = this.props.tooltipText;
    valueSeries.columns.template.propertyFields.fill = 'color';
    valueSeries.columns.template.propertyFields.stroke = 'color';
    valueSeries.columns.template.strokeWidth = 0;
  };

  render () {
    return (
      <div className={b()}>
        <Chart
          {...this.props}
          summaryNumber={this.props.summaryNumber}
          label={this.props.label}
          createChart={this.createChart}
          styleChart={this.styleChart}
        />
      </div>
    );
  }
}