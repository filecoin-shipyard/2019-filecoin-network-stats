import * as React from 'react';
import bemify from '../utils/bemify';
import './ContentArea.scss';

const b = bemify('content-area');

export const ContentArea: React.FunctionComponent<{}> = (props) => {
  return (
    <div className={b()}>
      <div className={b('inner')}>
        {props.children}
      </div>
    </div>
  )
};