import * as React from 'react';
import Tooltip from './Tooltip';

export default class AveragePriceTooltip extends React.Component {
  render() {
    const text = `Average value of all outstanding storage asks over the past 30 days.`;

    return (
      <Tooltip content={text} />
    );
  }
}