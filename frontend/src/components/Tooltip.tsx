import * as React from 'react';
import './Tooltip.scss';
import bemify from '../utils/bemify';

const b = bemify('tooltip');

export interface TooltipProps {
  content: React.ReactChild
  greyscale?: boolean
}

export default class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = {
    greyscale: false
  };

  render() {
    return (
      <span className={b()}>
        <img src={`/assets/question-mark-${this.props.greyscale ? 'greyscale' : 'normal'}.svg`} alt="?" />
        <div className={b('content')}>
          {this.props.content}
        </div>
      </span>
    );
  }
}