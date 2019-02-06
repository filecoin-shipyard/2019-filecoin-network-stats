import * as React from 'react';
import bemify from '../utils/bemify';
import c from 'classnames';
import './Dropdown.scss';

const b = bemify('dropdown');

export interface DropdownProps {
  titles: string[]
  defaultIndex?: number
  onSwitch?: (i: number) => void
}

export interface DropdownState {
  selectedIndex: number
  isShowing: boolean
}

export default class Dropdown extends React.Component<DropdownProps, DropdownState> {
  private r: HTMLDivElement | null = null;

  static defaultProps = {
    defaultIndex: 0,
    onSwitch: () => ({}),
  };

  constructor (props: DropdownProps) {
    super(props);

    if (props.defaultIndex >= props.titles.length) {
      throw new Error('default index out of bounds');
    }

    this.state = {
      selectedIndex: props.defaultIndex,
      isShowing: false
    };
  }

  componentDidMount () {
    window.addEventListener('mousedown', this.handleGlobalClick);
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleGlobalClick);
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

  onClickTitle (i: number) {
    return () => {
      if (i === this.state.selectedIndex) {
        return;
      }

      this.setState({
        selectedIndex: i,
        isShowing: false
      });

      if (this.props.onSwitch) {
        this.props.onSwitch(i);
      }
    };
  }

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
          {this.props.titles[this.state.selectedIndex]}
        </div>
        <div className={b('box')}>
          {this.props.titles.map((l: string, i: number) => {
            const linkName = c(b('link'), {
              [b('link', 'active')]: this.state.selectedIndex === i
            });

            return (
              <div className={linkName} onClick={this.onClickTitle(i)} key={l}>
                {l}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}