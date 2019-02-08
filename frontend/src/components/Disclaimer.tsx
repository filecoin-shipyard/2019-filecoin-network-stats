import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import {ContentArea} from './ContentArea';
import './Disclaimer.scss';

const b = bemify('disclaimer');

export default class Disclaimer extends React.Component {
  render() {
    return (
      <div className={b()}>
        <ContentArea>
          <Grid>
            <Col transparent>
              <div className={b('text')}>
                Disclaimer: Filecoin network and token data included on this dashboard are notional and for test and development purposes only.
              </div>
            </Col>
          </Grid>
        </ContentArea>
      </div>
    );
  }
}