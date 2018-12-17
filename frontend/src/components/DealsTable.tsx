import * as React from 'react';
import bemify from '../utils/bemify';
import ellipsify from '../utils/ellipsify';
import './DealsTable.scss';
import ContentHeader from './ContentHeader';

const b = bemify('deals-table');

export default class DealsTable extends React.Component {
  render () {
    return (
      <div className={b()}>
        <ContentHeader title="Deals" />
        <table className={b('table')}>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Price</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)}</td>
              <td>{ellipsify('fcq0dgwy9x22a7tke3xmgkm9aexqy2t0453w394ds', 15)}</td>
              <td>3.80</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}