import * as React from 'react';
import bemify from '../utils/bemify';
import Chart, {BaseChartProps} from './Chart';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import GraphColors from './GraphColors';

const b = bemify('line-chart');

export interface LineChartProps extends BaseChartProps {
  data: TimeseriesDatapoint[]
  barData?: TimeseriesDatapoint[]
  datapointProcessor?: (point: TimeseriesDatapoint) => TimeseriesDatapoint,
  barDatapointProcessor?: (point: TimeseriesDatapoint) => TimeseriesDatapoint
  tooltipText?: string
  lineColor?: am4core.Color
  barColor?: am4core.Color
}

export default class TimelineDateChart extends React.Component<LineChartProps, {}> {
  static defaultProps = {
    tooltipText: '{amount}',
    lineColor: GraphColors.TURQUOISE,
    barColor: GraphColors.TURQUOISE,
    datapointProcessor: (p: TimeseriesDatapoint) => p,
    barDatapointProcessor: (p: TimeseriesDatapoint) => p,
    barData: [] as TimeseriesDatapoint[],
  };

  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);

    const barDataIndex: { [k: number]: TimeseriesDatapoint } = {};
    for (const barPoint of this.props.barData) {
      barDataIndex[barPoint.date] = barPoint;
    }

    chart.data = this.props.data.map((point: TimeseriesDatapoint) => {
      const processed = this.props.datapointProcessor(point);
      const res = {
        amount0: processed.amount.toString(),
        amount1: '0',
        date: processed.date * 1000,
      };

      if (barDataIndex[point.date]) {
        res.amount1 = this.props.barDatapointProcessor(barDataIndex[point.date]).amount.toString();
      }

      return res;
    });

    const xAxis = chart.xAxes.push(new am4charts.DateAxis());
    xAxis.dateFormatter = new am4core.DateFormatter();

    const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.renderer.labels.template.dx = 5;

    if (this.props.barData.length) {
      const axis = chart.yAxes.push(new am4charts.ValueAxis());
      axis.renderer.opposite = true;
    }

    return chart;
  };

  styleChart = (chart: am4charts.XYChart) => {
    const valueSeries = chart.series.push(new am4charts.LineSeries());
    valueSeries.dataFields.dateX = 'date';
    valueSeries.dataFields.valueY = 'amount0';
    valueSeries.strokeWidth = 2;
    valueSeries.stroke = this.props.lineColor;
    valueSeries.fill = valueSeries.stroke;
    valueSeries.fillOpacity = 0.1;
    valueSeries.tooltipText = this.props.tooltipText;

    if (this.props.barData.length) {
      const barSeries = chart.series.push(new am4charts.ColumnSeries());
      barSeries.dataFields.dateX = 'date';
      barSeries.dataFields.valueY = 'amount1';
      barSeries.strokeWidth = 0;
      barSeries.fill = this.props.barColor;
      barSeries.yAxis = chart.yAxes.getIndex(1);

      const barAxis = chart.yAxes.getIndex(1) as am4charts.ValueAxis;
      barAxis.extraMax = 2;
    }
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