import * as React from 'react';
import {ChangeEvent} from 'react';
import bemify from '../utils/bemify';
import './Table.scss';
import ContentHeader from './ContentHeader';
import Dropdown from './Dropdown';
import * as c from 'classnames';
import debounce = require('lodash.debounce');

const b = bemify('table');

export interface TableProps {
  title?: string|React.ReactNode
  headers: (string | React.ReactNode)[]
  rows: React.ReactNode[][]
  keyGetter?: (i: number) => any
  perPage?: number
  sortTitles?: string[]
  onChangeSort?: (selectedSort: number) => void
  onChangeFilter?: (filter: string) => void
  onChangePage?: (num: number) => void
  filterPlaceholder?: string
  downloadUrl?: string | null
  rowCount: number
}

export interface TableState {
  currentPage: number
  currentSort: number
  enteredFilter: string
}

export default class Table extends React.Component<TableProps, TableState> {
  static defaultProps: Partial<TableProps> = {
    keyGetter: (i: number) => i,
    perPage: 10,
    sortTitles: [],
    downloadUrl: null,
    rowCount: 10,
  };

  constructor (props: TableProps) {
    super(props);

    this.state = {
      currentPage: 1,
      currentSort: 0,
      enteredFilter: '',
    };
  }

  onChangeFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const enteredFilter = e.target.value;
    this.setState({
      enteredFilter,
    });

    this.broadcastFilterChange(enteredFilter);
  };

  broadcastFilterChange = debounce((filter: string) => {
    this.props.onChangeFilter(filter);
  }, 100);

  onChangeSort = (i: number) => {
    this.setState({
      currentSort: i,
    });

    this.props.onChangeSort(i);
  };

  prev = () => {
    if (this.state.currentPage === 1) {
      return;
    }

    const currentPage = this.state.currentPage - 1;
    this.setState({
      currentPage,
    });

    this.props.onChangePage(currentPage);
  };

  next = () => {
    if (this.state.currentPage === Math.ceil(this.props.rowCount / this.props.perPage)) {
      return;
    }

    const currentPage = this.state.currentPage + 1;
    this.setState({
      currentPage,
    });

    this.props.onChangePage(currentPage);
  };

  render () {
    return (
      <div className={b()}>
        {this.renderTitle()}
        {this.renderSearchbar()}
        <div className={b('table-wrapper')}>
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
      </div>
    );
  }

  renderSearchbar () {
    if (!this.props.onChangeFilter) {
      return null;
    }

    return (
      <div className={b('search-download')}>
        <div className={b('search')}>
          <input
            type="text"
            onChange={this.onChangeFilter}
            value={this.state.enteredFilter}
            placeholder={this.props.filterPlaceholder || 'Filter...'}
          />
        </div>
        {this.renderDownload()}
        {this.renderSort()}
      </div>
    );
  }

  renderDownload () {
    if (!this.props.downloadUrl) {
      return null;
    }

    return (
      <a className={b('download')} href={this.props.downloadUrl}>
        <img src="/assets/download.svg" alt="" /> Download
      </a>
    );
  }

  renderSort () {
    if (!this.props.sortTitles.length) {
      return null;
    }

    return (
      <div className={b('sort')}>
        Sort By:
        <Dropdown
          titles={this.props.sortTitles}
          onSwitch={this.onChangeSort}
        />
      </div>
    );
  }

  renderTitle () {
    if (!this.props.title) {
      return null;
    }

    return (
      <ContentHeader>
        <div className={b('title')}>
          {this.props.title}
          {this.renderPager()}
        </div>
      </ContentHeader>
    );
  }

  renderPager () {
    if (this.props.perPage >= this.props.rowCount || !this.props.onChangePage) {
      return null;
    }

    let startRow = (this.state.currentPage - 1) * this.props.perPage + 1;

    let endRow = this.state.currentPage * this.props.perPage;
    if (endRow > this.props.rowCount) {
      endRow = this.props.rowCount;
    }

    const prevName = c(b('prev'), {
      [b('prev', 'disabled')]: startRow === 1,
    });
    const nextName = c(b('next'), {
      [b('next', 'disabled')]: endRow === this.props.rowCount,
    });

    return (
      <div className={b('pager')}>
        {startRow} - {endRow} of {this.props.rowCount}
        <div className={prevName} onClick={this.prev} />
        <div className={nextName} onClick={this.next} />
      </div>
    );
  }
}