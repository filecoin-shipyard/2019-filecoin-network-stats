import * as React from 'react';
import {CategoryDatapoint} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import bemify from '../utils/bemify';
import Chart, {BaseChartProps} from './Chart';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import ellipsify from '../utils/ellipsify';
import el from 'react-timeago';

const b = bemify('stacked-column-chart');

export interface StackedColumnChartProps extends BaseChartProps {
  data: CategoryDatapoint[]
  isPercentage?: boolean
  isDate?: boolean
  showBarLabels?: boolean
  categoryNames?: { [k: string]: string }
  colors?: am4core.Color[]
}

function percentageMapper (isDate: boolean, point: CategoryDatapoint) {
  return {
    category: isDate ? Number(point.category) * 1000 : point.category,
    ...Object.keys(point.data).reduce((acc: { [k: string]: string }, k: string) => {
      const ellipsifiedKey = ellipsify(k, 20);
      acc[ellipsifiedKey] = point.data[k].multipliedBy(100).toFixed(2);
      return acc;
    }, {}),
  };
}

function rawMapper (isDate: boolean, point: CategoryDatapoint) {
  return {
    category: isDate ? Number(point.category) * 1000 : point.category,
    ...Object.keys(point.data).reduce((acc: { [k: string]: string }, k: string) => {
      const ellipsifiedKey = ellipsify(k, 20);
      acc[ellipsifiedKey] = point.data[k].toString();
      return acc;
    }, {}),
  };
}

export default class StackedColumnChart extends React.Component<StackedColumnChartProps, {}> {
  static defaultProps = {
    isPercentage: true,
    isDate: false,
    categoryNames: {},
    showBarLabels: true,
  };

  createChart = (id: string) => {
    const chart = am4core.create(id, am4charts.XYChart);
    chart.data = this.props.data.map(this.props.isPercentage ?
      percentageMapper.bind(null, this.props.isDate) : rawMapper.bind(null, this.props.isDate));

    const categoryAxis = chart.xAxes.push(this.props.isDate ? new am4charts.DateAxis() : new am4charts.CategoryAxis());
    if (this.props.isDate) {
      (categoryAxis as am4charts.DateAxis).dataFields.date = 'category';
    } else {
      (categoryAxis as am4charts.CategoryAxis).dataFields.category = 'category';
    }

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.inside = true;
    if (this.props.isPercentage) {
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
    }

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'top';
    chart.legend.contentAlign = 'left';
    chart.legend.paddingLeft = 28;
    chart.legend.paddingBottom = 12;
    const template = chart.legend.markers.template;
    template.width = 16;
    template.height = 16;

    return chart;
  };

  styleChart = (chart: am4charts.XYChart) => {
    if (this.props.colors) {
      chart.colors.list = this.props.colors;
    }

    const createSeries = (field: string) => {
      // Set up series
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.name = this.props.categoryNames[field] || field;
      series.dataFields.valueY = field;
      if (this.props.isDate) {
        series.dataFields.dateX = 'category';
      } else {
        series.dataFields.categoryX = 'category';
      }
      series.sequencedInterpolation = true;
      series.stacked = true;
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = `[bold]{name}[/]\n[font-size:12px]{valueY}${this.props.isPercentage ? '%' : ''}`;

      if (this.props.showBarLabels) {
        const labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.text = this.props.isPercentage ? '{valueY}%' : '{valueY}';
        labelBullet.locationY = 0.5;
        labelBullet.fontSize = '12px';
        labelBullet.fontFamily = 'Open Sans, sans-serif';
      }

      return series;
    };

    const handled = new Set<string>();
    for (const point of chart.data) {
      for (const value of Object.keys(point)) {
        if (value === 'category' || handled.has(value)) {
          continue;
        }

        handled.add(value);
        createSeries(value);
      }
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
          padding={[6, 12, 12, 12]}
        />
      </div>
    );
  }
}