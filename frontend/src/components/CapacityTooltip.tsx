import * as React from 'react';
import Tooltip from './Tooltip';

export default class CapacityTooltip extends React.Component {
  render() {
    const text = `Sum of all pledged sectors. Future network upgrades will incorporate slashing.`;

    return (
      <Tooltip content={text} />
    );
  }
}