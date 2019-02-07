import * as React from 'react';
import Tooltip from './Tooltip';

export default class CapacityTooltip extends React.Component {
  render() {
    const text = `Network storage capacity is the sum of all pledged sectors.`;

    return (
      <Tooltip content={text} />
    );
  }
}