import * as React from 'react';
import Tooltip from './Tooltip';

export default class AveragePriceTooltip extends React.Component {
  render() {
    const text = `Average price is the average value of all outstanding storage asks.`;

    return (
      <Tooltip content={text} />
    );
  }
}