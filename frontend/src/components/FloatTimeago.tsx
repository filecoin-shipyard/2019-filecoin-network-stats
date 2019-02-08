import * as React from 'react';
import Timeago from 'react-timeago';
import BigNumber from 'bignumber.js';

export interface FloatTimeagoProps {
  date: number
}

export default class FloatTimeago extends React.Component<FloatTimeagoProps> {
  private timer: number = 0;

  componentDidMount () {
    this.tick();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  tick = () => {
    const diff = Date.now() - this.props.date;

    if (diff > 60000) {
      return;
    }

    this.forceUpdate(() => {
      this.timer = setTimeout(this.tick, 50);
    });
  };

  render () {
    const diff = Date.now() - this.props.date;

    if (diff > 60000) {
      return <Timeago
        date={this.props.date}
        formatter={this.formatTime}
      />;
    }

    const text = new BigNumber(diff).div(1000).toFixed(1);
    return (
      <time>
        {text}s ago
      </time>
    );
  }

  formatTime = (value: number, unit: string, suffix: string) => {
    if (unit === 'minute') {
      return `${value} mins ${suffix}`
    }

    return `${value} ${unit} ${suffix}`
  }
}