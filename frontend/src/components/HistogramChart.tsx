import * as React from 'react';
import {HistogramDatapoint} from 'filecoin-network-stats-common/lib/domain/HistogramDatapoint';
import bemify from '../utils/bemify';
import Chart, {BaseChartProps} from './Chart';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import GraphColors from './GraphColors';
import {makeHistogramAverage} from '../utils/averages';

const b = bemify('histogram-chart');

export interface AugmentedHistogramDatapoint extends HistogramDatapoint {
  label: string
  tooltipText: string
  fill?: am4core.Color
}

export interface HistogramChartProps extends BaseChartProps {
  data: HistogramDatapoint[]
  dataTransformer: (point: HistogramDatapoint) => AugmentedHistogramDatapoint
  showAverage?: boolean
  showBarLabels?: boolean
  barColor?: am4core.Color
  highlightMax?: boolean
  noTooltip?: boolean
}

export default class HistogramChart extends React.Component<HistogramChartProps> {
  static defaultProps = {
    dataTransformer: (point: HistogramDatapoint) => ({
      ...point,
      label: point.n.toString(),
      tooltipText: point.n.toString(),
    }),
    showAverage: false,
    showBarLabels: false,
    highlightMax: false,
    noTooltip: false
  };

  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);
    let max = 0;
    let maxIndex = 0;
    let nonZero = 0;
    const enrichedData = this.props.data.map((d: HistogramDatapoint, i: number) => {
      const point = this.props.dataTransformer(d);
      if (point.count > max) {
        max = point.count;
        maxIndex = i;
      }
      // we don't highlight max if there are fewer than 2
      // nonzero bars.
      if (point.count > 0) {
        nonZero++;
      }
      point.fill = am4core.color('#CCCFE0');
      return point;
    }) as any[];
    if (nonZero > 2) {
      enrichedData[maxIndex].fill = GraphColors.DARK_GREEN;
    }
    chart.data = enrichedData;

    const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'label';
    xAxis.renderer.minGridDistance = 0.001;
    chart.yAxes.push(new am4charts.ValueAxis());

    if (this.props.showAverage) {
      const avgAxis = chart.yAxes.push(new am4charts.ValueAxis());
      avgAxis.renderer.opposite = true;
    }

    return chart;
  };

  styleChart = (chart: am4charts.XYChart) => {
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'count';
    series.dataFields.categoryX = 'label';
    series.name = 'Storage Distribution';
    series.zIndex = 20;

    const columnTemplate = series.columns.template;
    columnTemplate.fillOpacity = 0.5;

    if (!this.props.noTooltip) {
      columnTemplate.tooltipText = '{tooltipText}';
    }

    columnTemplate.strokeOpacity = 0;
    if (this.props.barColor) {
      columnTemplate.fill = this.props.barColor;
    } else {
      columnTemplate.propertyFields.fill = 'fill';
    }

    if (this.props.showAverage) {
      const avgValue = makeHistogramAverage(this.props.data);

      const avg = chart.series.push(new am4charts.LineSeries());
      avg.dataFields.valueY = 'value';
      avg.dataFields.categoryX = 'label';
      avg.yAxis = chart.yAxes.getIndex(1);
      avg.strokeWidth = 2;
      avg.strokeDasharray = '4 1';
      avg.stroke = avg.fill = GraphColors.ORANGE;
      avg.zIndex = 10;
      avg.data = [
        {
          label: chart.data[0].label,
          value: avgValue,
        },
        {
          label: chart.data[chart.data.length - 1].label,
          value: avgValue,
        },
      ];
    }

    if (this.props.showBarLabels) {
      const labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = '{valueY}';
      labelBullet.locationY = 0.1;
      labelBullet.fontSize = '12px';
      labelBullet.fontFamily = 'Open Sans, sans-serif';
      labelBullet.fontWeight = 'bold';
      labelBullet.label.fill = am4core.color('#fff');
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