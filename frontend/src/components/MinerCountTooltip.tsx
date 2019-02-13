import * as React from 'react';
import Tooltip from './Tooltip';

export default class MinerCountTooltip extends React.Component {
  render() {
    const text = `Count of storage mining nodes that are currently heartbeating to this dashboard`;

    return (
      <Tooltip content={text} />
    );
  }
}