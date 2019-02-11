import * as React from 'react';
import SwitchableContent, {b as swB} from './SwitchableContent';
import c from 'classnames';
import {DURATIONS} from './DateSwitchingChart';
import bemify from '../utils/bemify';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import './SwitchableDateSwitchingChart.scss';


const b = bemify('switchable-date-switching-chart');

export interface SwitchableDateSwitchingChartProps {
  titles: (string | React.ReactNode)[]
  linkTitles: string[]
  onChangeDuration: (i: number, dur: ChartDuration) => Promise<void>
  renderContent: (i: number, isOverride: boolean) => React.ReactChild
}

export interface SwitchableDateSwitchingChartState {
  selectedIndex: number
  selectedDurationIndex: number
  isLoading: boolean
}

export class SwitchableDateSwitchingChart extends React.Component<SwitchableDateSwitchingChartProps, SwitchableDateSwitchingChartState> {
  constructor (props: SwitchableDateSwitchingChartProps) {
    super(props);

    this.state = {
      selectedIndex: 0,
      selectedDurationIndex: 2,
      isLoading: false,
    };
  }

  onClickDurationLink = (i: number) => {
    return async () => {
      if (i === this.state.selectedDurationIndex) {
        return;
      }

      this.setState({
        isLoading: true,
      });

      try {
        await this.props.onChangeDuration(this.state.selectedIndex, DURATIONS[i]);
      } catch (e) {
        console.error(e);
      } finally {
        this.setState({
          isLoading: false,
        });
      }

      this.setState({
        selectedDurationIndex: i,
      });
    };
  };

  onSwitch = (i: number) => {
    this.setState({
      selectedIndex: i,
      selectedDurationIndex: 2,
    });
  };

  render () {
    return (
      <div className={b()}>
        <SwitchableContent
          titles={this.props.titles}
          linkTitles={this.props.linkTitles}
          defaultIndex={0}
          onSwitch={this.onSwitch}
          renderExtraHeader={this.renderExtraHeader}
          renderContent={this.renderContent}
          dropdown
        />
      </div>
    );
  }

  renderExtraHeader = () => {
    const ret = [];

    for (let i = 0; i < DURATIONS.length; i++) {
      const link = DURATIONS[i];
      const name = c(b('durations'), swB('header-link'), {
        [swB('header-link', 'active')]: i === this.state.selectedDurationIndex,
      });

      ret.push(
        <div
          className={name}
          key={link}
          onClick={this.onClickDurationLink(i)}
        >
          {link}
        </div>,
      );
    }

    return (
      <div className={swB('header-links')}>
        {ret}
      </div>
    );
  };

  renderLoading () {
    return (
      <div className={b('loading')}>
        <img src="/assets/loader.svg" />
      </div>
    );
  }

  renderContent = (chartIndex: number) => {
    if (this.state.isLoading) {
      return this.renderLoading();
    }

    return this.props.renderContent(chartIndex, this.state.selectedDurationIndex !== 2);
  };
}