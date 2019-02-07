import * as React from 'react';
import Tooltip from './Tooltip';

export default class UtilizationTooltip extends React.Component {
  render() {
    const text = 'Utilization is calculated by dividing the number of committed sectors by the total number of pledged sectors.';

    return (
      <Tooltip content={text} />
    );
  }
}