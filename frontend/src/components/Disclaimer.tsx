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
                Disclaimer: Filecoin network and token data included on this dashboard are for test purposes only. Data included in this tool does not indicate any potential or future value of Filecoin tokens or storage on the network. Real data will not be available on this dashboard until the Filecoin main network has launched.
              </div>
            </Col>
          </Grid>
        </ContentArea>
      </div>
    );
  }
}