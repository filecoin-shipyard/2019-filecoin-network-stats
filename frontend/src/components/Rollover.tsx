import * as React from 'react';
import './Tooltip.scss';
import bemify from '../utils/bemify';
import * as c from 'classnames';
import './Rollover.scss';

const b = bemify('rollover');

export interface RolloverProps {
  content: React.ReactChild
  children: React.ReactChild|React.ReactChild[]
  bottom?: boolean
}

export default class Rollover extends React.Component<RolloverProps> {
  static defaultProps = {
    bottom: false
  };

  render() {
    const names = c(b(), {
      [b(null, 'bottom')]: this.props.bottom
    });

    return (
      <span className={names}>
        {this.props.children}
        <div className={b('content')}>
          {this.props.content}
        </div>
      </span>
    );
  }
}