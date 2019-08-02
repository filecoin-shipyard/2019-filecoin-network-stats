import * as React from 'react';
import './Main.scss';
import bemify from '../utils/bemify';
import GlobalNav from './GlobalNav';
import {Redirect, Route, Switch, withRouter} from 'react-router';
import Home from './Home';
import {ContentArea} from './ContentArea';
import Retrieval from './Retrieval';
import Macroeconomics from './Macroeconomics';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import {Action, Dispatch} from 'redux';
import {poll, StatsState} from '../ducks/stats';
import StorageMining from './storage/StorageMining';
import Warning from './Warning';
import StorageDeals from './storage/StorageDeals';
import StorageCostCapacity from './storage/StorageCostCapacity';
import DisclaimerModal from './DisclaimerModal';
import { SubNavbar } from './SubNavbar';

const b = bemify('main');

export interface MainDispatchProps {
  poll: () => Promise<void>
}

export interface MainStateProps {
  stats: StatsState | null
}

export type MainProps = MainDispatchProps & MainStateProps;

export class Main extends React.Component<MainProps> {
  async componentDidMount () {
    await this.props.poll();
  }

  render () {
    if (!this.props.stats.stats) {
      return null;
    }

    return (
      <div className={b()}>
        <div className={b('main')}>
          <GlobalNav />
          <SubNavbar />
          <Switch>
            <Route exact path="/storage" render={() => <Redirect to="/storage/mining" />} />
            <Route exact path="/storage/mining" render={this.wrapWithContentArea(StorageMining, false)} />
            <Route exact path="/storage/price-capacity"
                   render={this.wrapWithContentArea(StorageCostCapacity, false)} />
            <Route exact path="/storage/deals" render={this.wrapWithContentArea(StorageDeals, true)} />
            <Route path="/retrieval" render={this.wrapWithContentArea(Retrieval, true)} />
            <Route path="/token-metrics" render={this.wrapWithContentArea(Macroeconomics, false)} />
            <Route exact path="/" render={this.wrapWithContentArea(Home, false)} />
          </Switch>
        </div>
        <DisclaimerModal />
      </div>
    );
  }

  wrapWithContentArea (Component: React.ComponentClass, mocked: boolean) {
    return () => {
      return (
        <React.Fragment>
          <Warning
            text={
              mocked ?
                'Heads-up! We’re not able to provide data for this view yet. We will soon.' :
                'Disclaimer: Filecoin network and token data included in this dashboard are for test and development purposes only.'
            } />
          <ContentArea>
            <Component />
          </ContentArea>
        </React.Fragment>
      );
    };
  }
}

function mapStateToProps (state: AppState): MainStateProps {
  return {
    stats: state.stats,
  };
}

function mapDispatchToProps (dispatch: Dispatch<Action<Promise<void>>>): MainDispatchProps {
  return {
    poll: () => dispatch(poll() as any) as Promise<void>,
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main) as any);
