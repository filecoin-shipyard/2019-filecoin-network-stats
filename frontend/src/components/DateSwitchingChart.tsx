import * as React from 'react';
import SwitchableContent from './SwitchableContent';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import bemify from '../utils/bemify';
import './DateSwitchingChart.scss';

const b = bemify('date-switching-chart');

const DURATIONS = [
  ChartDuration.DAY,
  ChartDuration.WEEK,
  ChartDuration.MONTH,
  ChartDuration.YEAR,
  ChartDuration.ALL,
];

export interface DateSwitchingChartProps {
  title: string|React.ReactNode
  onChangeDuration: (dur: ChartDuration) => Promise<void>
  renderContent: (isOverride: boolean) => React.ReactChild
}

export interface DateSwitchingChartState {
  isLoading: boolean
}

export default class DateSwitchingChart extends React.Component<DateSwitchingChartProps, DateSwitchingChartState> {
  constructor (props: DateSwitchingChartProps) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  onSwitch = async (i: number) => {
    this.setState({
      isLoading: true,
    });

    try {
      await this.props.onChangeDuration(DURATIONS[i]);
    } catch (e) {
      console.log(e);
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  renderContent = (i: number) => {
    if (this.state.isLoading) {
      return this.renderLoading();
    }

    return this.props.renderContent(i !== 2);
  };

  render () {
    const titles = new Array(DURATIONS.length).fill(this.props.title);

    return (
      <div className={b()}>
        <SwitchableContent
          titles={titles}
          linkTitles={DURATIONS}
          defaultIndex={2}
          renderContent={this.renderContent}
          onSwitch={this.onSwitch}
        />
      </div>
    );
  }

  renderLoading () {
    return (
      <div className={b('loading')}>
        <img src="/assets/loader.svg" />
      </div>
    );
  }
}