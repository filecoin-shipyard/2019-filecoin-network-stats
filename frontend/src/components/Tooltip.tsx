import * as React from 'react';
import './Tooltip.scss';
import bemify from '../utils/bemify';
import Rollover from './Rollover';

const b = bemify('tooltip');

export interface TooltipProps {
  content: React.ReactChild
  greyscale?: boolean
  bottom?: boolean
}

export default class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = {
    greyscale: false,
    bottom: false,
  };

  render () {
    return (
      <span className={b()}>
        <Rollover content={this.props.content} bottom={this.props.bottom}>
        <img src={`/assets/question-mark-${this.props.greyscale ? 'greyscale' : 'normal'}.svg`} alt="?" />
      </Rollover>
      </span>
    );
  }
}