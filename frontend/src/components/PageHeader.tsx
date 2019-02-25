import * as React from 'react';
import bemify from '../utils/bemify';
import './PageHeader.scss';
import LabelledTooltip from './LabelledTooltip';
import Tooltip from './Tooltip';

const b = bemify('page-header');

export interface PageHeaderProps {
  title?: string
  tooltip?: string
}

export default class PageHeader extends React.Component<PageHeaderProps> {
  render () {
    return (
      <div className={b()}>
        {this.props.tooltip ?
          <LabelledTooltip tooltip={<Tooltip content={this.props.tooltip}/>} text={this.props.title}/> :
          this.props.title}
      </div>
    );
  }
}
