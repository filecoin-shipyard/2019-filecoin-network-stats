import * as React from 'react';
import bemify from '../utils/bemify';
import c from 'classnames';
import './Dropdown.scss';
import BaseDropdown from './BaseDropdown';

const b = bemify('dropdown');

export interface DropdownProps {
  titles: string[]
  defaultIndex?: number
  onSwitch?: (i: number) => void
}

export interface DropdownState {
  selectedIndex: number
}

export default class Dropdown extends React.Component<DropdownProps, DropdownState> {
  private r: BaseDropdown | null = null;

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
    };
  }

  onClickTitle (i: number) {
    return () => {
      if (i === this.state.selectedIndex) {
        return;
      }

      this.setState({
        selectedIndex: i,
      });

      if (this.r) {
        this.r.hide();
      }

      if (this.props.onSwitch) {
        this.props.onSwitch(i);
      }
    };
  }

  render () {
    return (
      <BaseDropdown
        ref={(r) => (this.r = r)}
        title={this.props.titles[this.state.selectedIndex]}
      >
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
      </BaseDropdown>
    );
  }
}