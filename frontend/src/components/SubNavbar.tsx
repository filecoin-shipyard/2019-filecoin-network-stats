import * as React from 'react';
import bemify from '../utils/bemify';
import './SubNavBar.scss';
import {Link, NavLink} from 'react-router-dom';
import c from 'classnames';
import ChangeNetworksModal from './ChangeNetworksModal';

const b = bemify('subnavbar');

export interface SubNavState {
  isShowingMenu: boolean
  isShowingChangeNetworks: boolean
}

export class SubNavbar extends React.Component<{}, SubNavState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      isShowingMenu: false,
      isShowingChangeNetworks: false,
    };
  }

  toggleMenu = () => this.setState({
    isShowingMenu: !this.state.isShowingMenu,
  });

  toggleChangeNetworks = () => this.setState({
    isShowingChangeNetworks: !this.state.isShowingChangeNetworks,
  });

  renderLinks () {
    return (
      <div className={b('links')}>
        <NavLink exact to="/" className={c(b('link'), b('link', 'home'))}>
          Network Overview
        </NavLink>
        <NavLink to="/storage" className={c(b('link'), b('link', 'storage'))}>
          Storage Menu
          <div className={b('sub-nav')}>
            <NavLink to="/storage/mining" className={b('sub-link')}>
              Mining
            </NavLink>
            <NavLink to="/storage/price-capacity" className={b('sub-link')}>
              Price & Capacity
            </NavLink>
            <NavLink to="/storage/deals" className={b('sub-link')}>
              Deal Stats
            </NavLink>
          </div>
        </NavLink>
        <NavLink to="/retrieval" className={c(b('link'), b('link', 'retrieval'))}>
          Retrieval Market
        </NavLink>
        <NavLink to="/token-metrics" className={c(b('link'), b('link', 'macroeconomics'))}>
          Token Metrics
        </NavLink>
      </div>
    );
  }

  renderFullSize () {
    return (
      <nav className={c(b(), b(null, 'full-size'))}>
        {this.renderLinks()}
      </nav>
    );
  }

  renderCollapsed () {
    const names = c(b(), b(null, 'collapsed'), {
      [b(null, 'menu-open')]: this.state.isShowingMenu,
    });

    return (
      <nav className={names}>
        <div className={b('background-wrapper')}>
          <div className={b('logo')}>
            <Link to="/"><img src="/assets/logo-nopadding.svg" alt="FileCoin" /> Filecoin</Link>
          </div>
          <div className={b('hamburger')} onClick={this.toggleMenu}>
            <img src="/assets/bars-solid.svg" alt="Show Menu" />
          </div>
        </div>
        {this.renderLinks()}
      </nav>
    );
  }

  renderSettings () {
    return (
      <ChangeNetworksModal isOpen={this.state.isShowingChangeNetworks} onRequestClose={this.toggleChangeNetworks} />
    );
  }

  render () {
    return (
      <React.Fragment>
        {this.renderFullSize()}
        {this.renderCollapsed()}
        {this.renderSettings()}
      </React.Fragment>
    );
  }
}