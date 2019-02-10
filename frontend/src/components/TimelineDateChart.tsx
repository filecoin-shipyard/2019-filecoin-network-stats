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
  tooltip?: string
  barTooltip?: string
  lineColor?: am4core.Color
  barColor?: am4core.Color
}

export default class TimelineDateChart extends React.Component<LineChartProps, {}> {
  static defaultProps = {
    tooltip: '{amount0}',
    barTooltip: '{amount1}',
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
    xAxis.startLocation = 0.5;
    xAxis.endLocation = 0.5;

    const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    if (this.props.barData.length) {
      const axis = chart.yAxes.push(new am4charts.ValueAxis());
      axis.renderer.opposite = true;
      axis.min = 0;
    }

    chart.cursor = new am4charts.XYCursor();

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
    valueSeries.tooltipText = this.props.tooltip;

    if (this.props.barData.length) {
      const barSeries = chart.series.push(new am4charts.ColumnSeries());
      barSeries.dataFields.dateX = 'date';
      barSeries.dataFields.valueY = 'amount1';
      barSeries.strokeWidth = 0;
      barSeries.fill = this.props.barColor;
      barSeries.yAxis = chart.yAxes.getIndex(1);
      barSeries.tooltipText = this.props.barTooltip;
      barSeries.columns.template.width = 16;

      const barAxis = chart.yAxes.getIndex(1) as am4charts.ValueAxis;
      barAxis.extraMax = 2;
    }
  };

  render () {
    return (
      <div className={b()}>
        <Chart
          {...this.props}
          padding={[24, 24, 12, 24]}
          summaryNumber={this.props.summaryNumber}
          label={this.props.label}
          createChart={this.createChart}
          styleChart={this.styleChart}
        />
      </div>
    );
  }
}