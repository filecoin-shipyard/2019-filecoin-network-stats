import * as React from 'react';
import bemify from '../utils/bemify';
import ContentHeader from './ContentHeader';
import * as Modal from 'react-modal';
import './DisclaimerModal.scss';

const b = bemify('disclaimer-modal');

export interface DisclaimerModalState {
  isOpen: boolean
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
    maxWidth: '500px',
    marginLeft: '24px',
    marginRight: '24px',
    boxShadow: '0 1px 16px rgba(0,0,0,0.20)',
    borderRadius: '3px',
    border: '0',
  },
};

export default class DisclaimerModal extends React.Component<{}, DisclaimerModalState> {
  constructor (props: {}) {
    super(props);

    this.state = {
      isOpen: localStorage.getItem('hasAcceptedDisclaimer') !== '1',
    };
  }

  onClickOK = () => {
    localStorage.setItem('hasAcceptedDisclaimer', '1');
    this.setState({
      isOpen: false,
    });
  };

  render () {
    return (
      <Modal
        isOpen={this.state.isOpen}
        style={styles}
      >
        <div className={b()}>
          <ContentHeader title="Disclaimer" />
          <div className={b('content')}>
            <p>
              Filecoin network and token data included on this dashboard are notional and for test and development
              purposes
              only. The official Filecoin token will not be released until main network launch. Any person or exchange
              that
              claims to be selling Filecoin tokens until then is likely fraudulent.
            </p>
            <button onClick={this.onClickOK} className={b('ok')}>
              OK
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}