import * as React from 'react';
import './SingleStat.scss';
import bemify from '../utils/bemify';
import classnames from 'classnames';

const b = bemify('single-stat');

export interface SingleStatProps {
  value: string
  unit: string
  subtitle: string
  trend?: number
  duration?: string
  tooltip?: React.ReactNode
}

export class SingleStat extends React.Component<SingleStatProps, {}> {
  render () {
    const trendClass = classnames(b('trend'), {
      [b('trend', 'up')]: this.props.trend > 0,
      [b('trend', 'down')]: this.props.trend < 0,
      [b('trend', 'same')]: !this.props.trend,
    });

    return (
      <div className={b()}>
        <div className={b('subtitle')}>
          {this.props.subtitle} {this.props.tooltip || ''}
        </div>
        <div className={b('name')}>
          {this.props.value} <span className={b('unit')}>{this.props.unit}</span>
        </div>
        <div className={b('bottom')}>
          <div className={trendClass}>
            {typeof this.props.trend === 'undefined' ? '--' : this.props.trend}%
          </div>
          {this.renderDuration()}
        </div>
      </div>
    );
  }

  renderDuration () {
    if (!this.props.duration) {
      return null;
    }

    return (
      <div className={b('duration')}>
        ({this.props.duration})
      </div>
    );
  }
};