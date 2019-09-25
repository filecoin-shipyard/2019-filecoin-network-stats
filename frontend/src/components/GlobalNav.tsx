import * as React from 'react';
import bemify from '../utils/bemify';
import './GlobalNav.scss';
import {connect} from 'react-redux';
import {Network} from '../utils/net';
import {AppState} from '../ducks/store';
import ChangeNetworksModal from './ChangeNetworksModal';
import {Link, NavLink} from 'react-router-dom';
import c from 'classnames';
import {ContentArea} from './ContentArea';
import BaseDropdown from './BaseDropdown';

const b = bemify('globalnav');

export interface HeaderStateProps {
  isShowingGlobalNav: boolean
  isShowingNetworks: boolean
  currentNetwork: Network
}

const HeaderStateProps = class GlobalNav extends React.Component<HeaderStateProps> {

  private dropdowns: { [k: string]: BaseDropdown } = {};

  constructor (props: HeaderStateProps) {
    super(props);

    this.state = {
      isShowingGlobalNav: true,
      isShowingNetworks: true,
      currentNetwork: this.props.currentNetwork
    };
  }


  renderGlobalNav () {
    const style= this.props.isShowingGlobalNav ? {} : { display: 'none'};

    var location = window.location.href;
    
    var network_type = 'user'; // default is user devnet

    var re_staging = /staging/gi;
    var re_local = /local/gi;

    if (location.search(re_staging) !== -1 ) { 
      network_type = 'staging';
    } else if (location.search(re_local) !== -1 ) { 
      network_type = 'local';
    }

    return (
      <div className={c(b(), b(null, 'full-size'))} style={style}>
        <div className={b(null, 'inner')}>
          <Link to="/" className={b(null, 'logo')}>
            <img src="/assets/logo-nopadding.svg" alt="FileCoin" />
            Filecoin
          </Link>
          {this.renderNetworkInfo(network_type)}
          {this.renderNetworkLinks(network_type)}
        </div>
      </div>
    );
  }
  renderNetworkName () {
    switch(this.props.currentNetwork) {
      case Network.STABLE:
        return 'User Devnet';
      case Network.OLD_STABLE_2:
        return 'Old Devnet 2';
      case Network.OLD_STABLE_1:
        return 'Old Devnet 1';
      case Network.CUSTOM:
        return 'Custom';
      default:
        return 'Unknown';
    }
  }

  checkNetworkType () {
    var location = window.location.href;
    var re_staging = /staging/gi;
    var re_local = /local/gi;
    var network_type = 'user'; // default is user devnet

    if (location.search(re_staging) !== -1 ) { 
      network_type = 'staging';
    } else if (location.search(re_local) !== -1 ) { 
      network_type = 'local';
    }
    return network_type;
  }

  renderNetworkLinks = (network_type : string) => {

    // default is user devnet links
    var explorer_url = 'http://user.kittyhawk.wtf:8000/';
    var faucet_url = 'http://user.kittyhawk.wtf:9797/';

    if (network_type === 'staging') {
      explorer_url = 'https://explorer.staging.kittyhawk.wtf/';
      faucet_url = 'https://faucet.staging.kittyhawk.wtf/';
    }

    return (
      <div className={b(null, 'links')}>
        <BaseDropdown title='Links'>
          <ul>
            <li><a href={explorer_url} target="_blank">Block Explorer</a></li>
            <li><a href={faucet_url} target="_blank">Faucet</a></li>
            <li><a href="https://github.com/filecoin-project/go-filecoin/wiki/Troubleshooting-&-FAQ#known-issues" target="_blank">Known Issues</a></li>
            <li><a href="https://discuss.filecoin.io/" target="_blank">Forums</a></li>
            <li><a href="https://filecoin.io/faqs/" target="_blank">FAQs</a></li>
          </ul>
        </BaseDropdown>
      </div>
    )
  };

  renderNetworkRelease = (network_type: string) => {
    var src_url = "https://img.shields.io/endpoint.svg?color=3FC1CB&labelColor=3FC1CB&style=flat-square&label=User%20Devnet&url=https://raw.githubusercontent.com/filecoin-project/go-filecoin-badges/master/user-devnet.json"; // default is user devnet

    if (network_type === 'staging') {
      src_url = "https://img.shields.io/endpoint.svg?color=3FC1CB&labelColor=3FC1CB&style=flat-square&label=Staging%20Devnet&url=https://raw.githubusercontent.com/filecoin-project/go-filecoin-badges/master/staging-devnet.json"; 

    } else if (network_type === 'local') {
      src_url = "https://img.shields.io/badge/-Dashboard%20Localhost-brightgreen"; 
    }

    return (
      <div className={b(null, 'info')}>
        <span className="label">Network</span>
        <span className="name">
          <a href="https://github.com/filecoin-project/go-filecoin/releases/latest" target="_blank">
            <img src={src_url} />
          </a>
        </span>
      </div>
    )
  };

  renderNetworkInfo (network_type : string) {
    var style = this.props.isShowingNetworks ? {} : { display: 'none'};
    if (network_type === '') {
      style = { display: 'none'};
    }

    return (
      <div className={b(null, 'info-group')} style={style}>
        {this.renderNetworkRelease(network_type)}
      </div>
    );
  }

  render () {
    return (
      <React.Fragment>
        {this.renderGlobalNav()}
      </React.Fragment>
    );
  }
}

function mapStateToProps (state: AppState): HeaderStateProps {
  return {
    currentNetwork: state.stats.network,
    isShowingNetworks: true,
    isShowingGlobalNav: true
  };
}

export default connect(mapStateToProps)(HeaderStateProps);
