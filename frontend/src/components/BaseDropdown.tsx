import * as React from 'react';
import bemify from '../utils/bemify';
import c from 'classnames';
import './Dropdown.scss';

const b = bemify('dropdown');

export interface BaseDropdownProps {
  title: string
  children: any
}

export interface BaseDropdownState {
  isShowing: boolean
}

export default class BaseDropdown extends React.Component<BaseDropdownProps, BaseDropdownState> {
  private r: HTMLDivElement | null = null;

  constructor (props: BaseDropdownProps) {
    super(props);

    this.state = {
      isShowing: false
    };
  }

  componentDidMount () {
    window.addEventListener('mousedown', this.handleGlobalClick);
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleGlobalClick);
  }

  hide () {
    this.setState({
      isShowing: false,
    })
  }

  handleGlobalClick = (e: MouseEvent) => {
    let node = e.target as HTMLElement;

    while (node && node !== document.body) {
      if (node === this.r) {
        return;
      }

      node = node.parentElement;
    }

    this.setState({
      isShowing: false
    });
  };

  toggleDropdown = () => {
    this.setState({
      isShowing: !this.state.isShowing
    });
  };

  render () {
    const names = c(b(), {
      [b(null, 'open')]: this.state.isShowing
    });

    return (
      <div className={names} ref={(r: HTMLDivElement) => (this.r = r)}>
        <div className={b('selected')} onClick={this.toggleDropdown}>
          {this.props.title}
        </div>
        <div className={b('box')}>
          {this.props.children}
        </div>
      </div>
    );
  }
}