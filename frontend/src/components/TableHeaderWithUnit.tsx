import * as React from 'react';
import bemify from '../utils/bemify';
import './TableHeaderWithUnit.scss';

const b = bemify('table-header-with-unit');

export interface TableHeaderWithUnitProps {
  unit: string
  label: string
}

export default class TableHeaderWithUnit extends React.Component<TableHeaderWithUnitProps> {
  render () {
    return (
      <div className={b()}>
        <div className={b('label')}>
          {this.props.label}
        </div>
        <div className={b('unit')}>
          ({this.props.unit})
        </div>
      </div>
    );
  }
}