import * as React from 'react';
import Tooltip from './Tooltip';

export default class UtilizationTooltip extends React.Component {
  render() {
    const text = 'Total number of committed sectors divided by the total number of pledged sectors for all time. Future network upgrades will incorporate slashing.';

    return (
      <Tooltip content={text} />
    );
  }
}