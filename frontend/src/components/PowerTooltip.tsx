import * as React from 'react';
import Tooltip from './Tooltip';

export default class PowerTooltip extends React.Component {
  render() {
    const text = `Probability that a storage miner will win the ability to mine the next block.`;

    return (
      <Tooltip content={text} />
    );
  }
}