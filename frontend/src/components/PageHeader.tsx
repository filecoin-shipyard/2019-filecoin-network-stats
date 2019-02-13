import * as React from 'react';
import bemify from '../utils/bemify';
import './PageHeader.scss';

const b = bemify('page-header');

export interface PageHeaderProps {
  title?: string
}

export default class PageHeader extends React.Component<PageHeaderProps> {
  render () {
    return (
      <div className={b()}>
        {this.props.title}
      </div>
    );
  }
}
