import * as React from 'react';
import Tooltip from './Tooltip';

export default class VolumeTransactedTooltip extends React.Component {
  render() {
    const text = `The sum of the absolute value of all FIL transacted on-chain, less distributed block rewards. The red bars represent days where volume is less than the day before.`;

    return (
      <Tooltip content={text} />
    );
  }
}