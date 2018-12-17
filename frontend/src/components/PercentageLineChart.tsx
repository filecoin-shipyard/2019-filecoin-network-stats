import * as React from 'react';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import Chart, {BaseChartProps} from './Chart';
import * as am4charts from '@amcharts/amcharts4/charts';
import bemify from '../utils/bemify';
import * as am4core from '@amcharts/amcharts4/core';
import GraphColors from './GraphColors';
import ellipsify from '../utils/ellipsify';

const b = bemify('percentage-line-chart');

export interface PercentageLineChartProps extends BaseChartProps {
  data: CategoryDatapoint[]
}

export default class PercentageLineChart extends React.Component<PercentageLineChartProps> {
  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);
    chart.data = this.props.data.map((point: CategoryDatapoint) => ({
      category: Number(point.category) * 1000,
      ...Object.keys(point.data).reduce((acc: { [k: string]: string }, k: string) => {
        const ellipsifiedKey = ellipsify(k, 20);
        acc[ellipsifiedKey] = point.data[k].multipliedBy(100).toFixed(2);
        return acc;
      }, {}),
    }));

    chart.paddingTop = 0;
    chart.paddingBottom = 12;
    chart.paddingLeft = 24;
    chart.paddingRight = 36;
    chart.colors.list = [
      GraphColors.BLUE,
      GraphColors.PURPLE,
      GraphColors.GREEN,
      GraphColors.TURQUOISE,
    ];

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.startLocation = 0.5;
    dateAxis.endLocation = 0.5;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.tooltip.disabled = true;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'top';
    chart.legend.contentAlign = 'left';
    chart.legend.paddingTop = 0;
    chart.legend.paddingLeft = 32;
    const template = chart.legend.markers.template;
    template.width = 16;
    template.height = 16;

    return chart;
  };

  styleChart = (chart: am4charts.XYChart) => {
    const seriesNames = Object.keys(chart.data[0]);
    for (const name of seriesNames) {
      if (name === 'category') {
        continue;
      }

      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = 'category';
      series.name = name;
      series.dataFields.valueY = name;
      series.stacked = true;
      series.fillOpacity = 0.5;
      series.strokeWidth = 1;
      series.strokeOpacity = 1;
      series.tooltipText = `[bold]{name}[/]\n[font-size:12px]{valueY}%`;
    }

    chart.yAxes.getIndex(0).numberFormatter.numberFormat = '###\'%\'';

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = chart.xAxes.getIndex(0);
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