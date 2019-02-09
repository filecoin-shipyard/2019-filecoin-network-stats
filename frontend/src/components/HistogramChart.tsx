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
}

export interface HistogramChartProps extends BaseChartProps {
  data: HistogramDatapoint[]
  dataTransformer: (point: HistogramDatapoint) => AugmentedHistogramDatapoint
  showAverage?: boolean
  showBarLabels?: boolean
  barColor?: am4core.Color
  heatMapped?: boolean
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
    heatMapped: false
  };

  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);
    chart.data = this.props.data.map(this.props.dataTransformer);

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

    const xAxis = chart.xAxes.getIndex(0);
    // xAxis.renderer.minLabelPosition = -0.05;

    const columnTemplate = series.columns.template;
    if (this.props.heatMapped) {
      series.heatRules.push({
        min: 0.1,
        max: 0.8,
        property: 'fillOpacity',
        target: columnTemplate,
        dataField: 'valueY',
      });
    } else {
      columnTemplate.fillOpacity = 0.5;
    }

    columnTemplate.tooltipText = '{tooltipText}';
    if (this.props.barColor) {
      columnTemplate.fill = columnTemplate.stroke = this.props.barColor;
      columnTemplate.strokeWidth = 0.5;
    } else {
      columnTemplate.strokeOpacity = 0;
      columnTemplate.fill = am4core.color('#CCCFE0');
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