import * as React from 'react';
import bemify from '../utils/bemify';
import './ContentHeader.scss';

const b = bemify('content-header');

export interface ContentHeaderProps {
  title?: string
}

export default class ContentHeader extends React.Component<ContentHeaderProps> {
  render () {
    return (
      <div className={b()}>
        {this.props.title || this.props.children}
      </div>
    );
  }
}