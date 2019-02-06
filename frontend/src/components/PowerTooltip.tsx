import * as React from 'react';
import Tooltip from './Tooltip';

export default class PowerTooltip extends React.Component {
  render() {
    const text = `Mining power is a miner's pledged sectors divided by the total pledges of the network.`;

    return (
      <Tooltip content={text} />
    );
  }
}