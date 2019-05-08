import * as React from 'react';
import {ChangeEvent} from 'react';
import bemify from '../utils/bemify';
import ContentHeader from './ContentHeader';
import * as Modal from 'react-modal';
import './ChangeNetworksModal.scss';
import {Network} from '../utils/net';
import {connect} from 'react-redux';
import {switchNetwork} from '../ducks/stats';
import {Dispatch} from 'redux';
import {AppState} from '../ducks/store';
import {ThunkAction} from 'redux-thunk';
import c from 'classnames';

const b = bemify('change-networks-modal');

export interface ChangeNetworksModalOwnProps {
  isOpen: boolean
  onRequestClose: () => void
}

export interface ChangeNetworksModalStateProps {
  currentNetwork: Network
  currentCustomURL: string
}

export interface ChangeNetworksModalDispatchProps {
  switchNetwork: (network: Network, customURL: string) => ThunkAction<Promise<void>, AppState, any, any>
}

export type ChangeNetworksModalProps =
  ChangeNetworksModalOwnProps
  & ChangeNetworksModalStateProps
  & ChangeNetworksModalDispatchProps;

export interface ChangeNetworksModalState {
  network: Network
  customURL: string
  isLoading: boolean
  errorMessage: string
}

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'static',
    padding: '0',
    maxWidth: '600px',
    marginLeft: '24px',
    marginRight: '24px',
    boxShadow: '0 1px 16px rgba(0,0,0,0.20)',
    borderRadius: '3px',
    border: '0',
  },
};

export class ChangeNetworksModal extends React.Component<ChangeNetworksModalProps, ChangeNetworksModalState> {
  constructor (props: ChangeNetworksModalProps) {
    super(props);

    this.state = {
      network: this.props.currentNetwork,
      customURL: this.props.currentCustomURL,
      isLoading: false,
      errorMessage: '',
    };
  }

  updateField (key: keyof ChangeNetworksModalState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => this.setState({
      [key]: e.target.value,
    } as any);
  }

  render () {
    const buttonNames = c(b('ok'), {
      [b('ok', 'loading')]: this.state.isLoading,
    });

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        style={styles}
      >
        <div className={b()}>
          <ContentHeader title="Change Networks" />
          <div className={b('content')}>
            {this.renderError()}
            <p>
              By default, statistics are displayed for the devnet network.
              To view stats for a different network, pick one from the dropdown below.
            </p>
            <p>
              <label>
                Network Name
              </label>
              <select value={this.state.network} onChange={this.updateField('network')}>
                <option value={Network.STABLE}>Devnet</option>
                <option value={Network.OLD_STABLE_2}>Old Devnet 2</option>
                <option value={Network.OLD_STABLE_1}>Old Devnet 1</option>
                <option value={Network.CUSTOM}>Custom</option>
              </select>
            </p>
            {this.renderCustomURL()}
            <div className={b('button-wrapper')}>
              <button onClick={this.onClickOK} className={buttonNames} disabled={this.shouldDisableButton()}>
                {this.state.isLoading ? this.renderLoading() : 'OK'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  shouldDisableButton () {
    return this.state.isLoading ||
      (this.state.network === Network.CUSTOM &&
        (this.state.customURL.toLowerCase().indexOf('http') === -1 ||
          this.state.customURL.length <= 7));
  }

  onClickOK = async () => {
    try {
      this.setState({
        isLoading: true,
      });
      await this.props.switchNetwork(this.state.network, this.state.customURL);
      this.props.onRequestClose();
      this.setState({
        errorMessage: '',
      });
    } catch (e) {
      console.error(e);
      this.setState({
        errorMessage: 'An error occurred, please try a different network.',
      });
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  renderCustomURL () {
    if (this.state.network !== Network.CUSTOM) {
      return null;
    }

    return (
      <p>
        <label>
          Dashboard URL
        </label>
        <input type="text" value={this.state.customURL} onChange={this.updateField('customURL')} />
        <small>For custom devnets, we'll need the URL of your dashboard's web server.</small>
      </p>
    );
  }

  renderLoading () {
    return (
      <img src="/assets/loader-dark.svg" alt="Loading" className={b('loader')} />
    );
  }

  renderError () {
    if (!this.state.errorMessage) {
      return null;
    }

    return (
      <div className={b('error-message')}>
        {this.state.errorMessage}
      </div>
    );
  }
}

function mapStateToProps (state: AppState): ChangeNetworksModalStateProps {
  return {
    currentNetwork: state.stats.network,
    currentCustomURL: state.stats.customURL,
  };
}

function mapDispatchToProps (dispatch: Dispatch<any>): ChangeNetworksModalDispatchProps {
  return {
    switchNetwork: (network: Network, customURL: string) => dispatch(switchNetwork(network, customURL)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangeNetworksModal) as React.ComponentClass<ChangeNetworksModalOwnProps, ChangeNetworksModalState>;