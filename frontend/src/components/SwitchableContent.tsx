import * as React from 'react';
import bemify from '../utils/bemify';
import ContentHeader from './ContentHeader';
import c from 'classnames';
import './SwitchableContent.scss';
import Dropdown from './Dropdown';

const b = bemify('switchable-content');

export interface SwitchableContentProps {
  children?: React.ReactChild | React.ReactChild[]
  renderContent?: (index: number) => React.ReactChild
  titles: string[]
  linkTitles: string[]
  dropdown?: boolean
  onSwitch?: (i: number) => void
  defaultIndex: number
}

export interface SwitchableContentState {
  selectedIndex: number
}

export default class SwitchableContent extends React.Component<SwitchableContentProps, SwitchableContentState> {
  private r: HTMLDivElement | null = null;

  static defaultProps = {
    dropdown: false,
    defaultIndex: 0
  };

  constructor (props: SwitchableContentProps) {
    super(props);

    if (props.titles.length !== props.linkTitles.length) {
      throw new Error('titles, and linkTitles must all be the same length');
    }

    const childCount = React.Children.count(this.props.children);
    if (!props.renderContent && !childCount) {
      throw new Error('must define either children or renderContent');
    }

    if (!props.renderContent && childCount !== props.titles.length) {
      throw new Error('must have same number of children as titles if children are passed');
    }

    if (props.defaultIndex >= props.titles.length) {
      throw new Error('default index out of bounds');
    }

    this.state = {
      selectedIndex: this.props.defaultIndex
    };
  }

  onClickLink (i: number) {
    return () => {
      if (i === this.state.selectedIndex) {
        return;
      }

      this.setState({
        selectedIndex: i
      });

      if (this.props.onSwitch) {
        this.props.onSwitch(i);
      }
    };
  }

  onSwitchDropdown = (i: number) => {
    this.setState({
      selectedIndex: i
    });

    if (this.props.onSwitch) {
      this.props.onSwitch(i);
    }
  };

  render () {
    return (
      <div className={b()}>
        <ContentHeader>
          <div className={b('header-wrapper')}>
            <div className={b('header-title')}>
              {this.props.titles[this.state.selectedIndex]}
            </div>
            {this.props.dropdown ? this.renderDropdown() : this.renderLinks()}
          </div>
        </ContentHeader>
        <div className={b('content')}>
          {this.props.renderContent ? this.props.renderContent(this.state.selectedIndex) : React.Children.toArray(this.props.children)[this.state.selectedIndex]}
        </div>
      </div>
    );
  }

  renderLinks () {
    const ret = [];

    for (let i = 0; i < this.props.linkTitles.length; i++) {
      const link = this.props.linkTitles[i];
      const name = c(b('header-link'), {
        [b('header-link', 'active')]: i === this.state.selectedIndex
      });

      ret.push(
        <div
          className={name}
          key={link}
          onClick={this.onClickLink(i)}
        >
          {link}
        </div>
      );
    }

    return (
      <div className={b('header-links')}>
        {ret}
      </div>
    );
  }

  renderDropdown () {
    return (
      <Dropdown
        titles={this.props.linkTitles}
        onSwitch={this.onSwitchDropdown}
      />
    );
  }
}