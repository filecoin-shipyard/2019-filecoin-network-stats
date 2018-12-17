import * as React from 'react';
import bemify from '../utils/bemify';
import './Table.scss';
import ContentHeader from './ContentHeader';

const b = bemify('table');

export interface TableProps {
  title?: string
  headers: (string|React.ReactNode)[]
  rows: React.ReactNode[][]
  pageCount?: number
  keyGetter?: (i: number) => any
}

export default class Table extends React.Component<TableProps, {}> {
  static defaultProps = {
    keyGetter: (i: number) => i,
  };

  render() {
    return (
      <div className={b()}>
        {this.renderTitle()}
        <table className={b('table')}>
          <thead>
            <tr>
              {this.props.headers.map((h: string, i: number) => <th className={b('header')} key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {this.props.rows.map((r: React.ReactNode[], i: number) => (
              <tr className={b('body-row')} key={this.props.keyGetter(i)}>
                {r.map((cell: React.ReactNode, j: number) => <td className={b('cell')} key={`${i}-${j}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderTitle () {
    if (!this.props.title) {
      return null;
    }

    return (
      <ContentHeader title={this.props.title} />
    );
  }
}