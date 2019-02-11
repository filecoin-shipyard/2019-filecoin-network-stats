import * as React from 'react';
import bemify from '../utils/bemify';
import './ClickCopyable.scss';
import * as c from 'classnames';
import copy = require('copy-to-clipboard');

const b = bemify('click-copyable');

export interface ClickCopyableProps {
  copyData: string
}

export interface ClickCopyableState {
  didCopy: boolean
}

export default class ClickCopyable extends React.Component<ClickCopyableProps, ClickCopyableState> {
  private timer: number | null;

  constructor (props: ClickCopyableProps) {
    super(props);

    this.timer = null;

    this.state = {
      didCopy: false,
    };
  }

  copy = () => {
    copy(this.props.copyData);
    this.setState({
      didCopy: true,
    });

    this.timer = setTimeout(() => this.setState({
      didCopy: false,
    }), 1500);
  };

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render () {
    const names = c(b(), {
      [b(null, 'copied')]: this.state.didCopy,
    });

    return (
      <div className={names} onClick={this.copy}>
        {this.props.children}
      </div>
    );
  }
}