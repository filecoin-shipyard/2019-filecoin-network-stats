import * as React from 'react';
import bemify from '../utils/bemify';
import './Warning.scss';
import {ContentArea} from './ContentArea';

const b = bemify('warning');

export interface WarningProps {
  text: string
}

export default class Warning extends React.Component<WarningProps> {
  render () {
    return (
      <div className={b()}>
        <ContentArea>
          {this.props.text}
        </ContentArea>
      </div>
    );
  }
}