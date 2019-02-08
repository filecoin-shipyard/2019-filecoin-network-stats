import * as React from 'react';
import Tooltip from './Tooltip';

export default class MinerCountTooltip extends React.Component {
  render() {
    const text = `Total storage miners are calculated by counting all of the currently heartbeating and mining nodes every 5 minutes.`;

    return (
      <Tooltip content={text} />
    );
  }
}