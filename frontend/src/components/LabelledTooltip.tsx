import * as React from 'react';
import bemify from '../utils/bemify';
import './LabelledTooltip.scss';
import * as c from 'classnames';

const b = bemify('labelled-tooltip');

export interface LabelledTooltipProps {
  tooltip: React.ReactNode
  text: string
  inline?: boolean
}

export default class LabelledTooltip extends React.Component<LabelledTooltipProps> {
  static defaultProps = {
    inline: false,
  };

  render () {
    const names = c(b(), {
      [b(null, 'inline')]: this.props.inline,
    });

    return (
      <span className={names}>
        {this.props.text} {this.props.tooltip}
      </span>
    );
  }
}