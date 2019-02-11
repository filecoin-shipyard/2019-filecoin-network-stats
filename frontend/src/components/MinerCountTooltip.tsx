import * as React from 'react';
import Tooltip from './Tooltip';

export default class MinerCountTooltip extends React.Component {
  render() {
    const text = `Count of currently heartbeating and storage mining nodes.`;

    return (
      <Tooltip content={text} />
    );
  }
}