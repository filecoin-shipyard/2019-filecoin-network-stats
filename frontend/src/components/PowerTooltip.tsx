import * as React from 'react';
import Tooltip from './Tooltip';

export default class PowerTooltip extends React.Component {
  render() {
    const text = `The probability that a storage miner will win the ability to mine the next block.  Miners gain power by storing data, sealing it, and proving they still have it (providing a Proof-of-Spacetime).`;

    return (
      <Tooltip content={text} />
    );
  }
}