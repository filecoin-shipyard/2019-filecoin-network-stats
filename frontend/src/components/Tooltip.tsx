import * as React from 'react';
import './Tooltip.scss';
import bemify from '../utils/bemify';
import * as c from 'classnames';

const b = bemify('tooltip');

export interface TooltipProps {
  content: React.ReactChild
  greyscale?: boolean
  bottom?: boolean
}

export default class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = {
    greyscale: false,
    bottom: false
  };

  render() {
    const names = c(b(), {
      [b(null, 'bottom')]: this.props.bottom
    });

    return (
      <span className={names}>
        <img src={`/assets/question-mark-${this.props.greyscale ? 'greyscale' : 'normal'}.svg`} alt="?" />
        <div className={b('content')}>
          {this.props.content}
        </div>
      </span>
    );
  }
}