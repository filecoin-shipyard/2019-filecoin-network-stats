import * as React from 'react';
import bemify from '../utils/bemify';
import './Grid.scss';
import classnames = require('classnames');

const b = bemify('grid');

export interface GridProps {
  children: React.ReactNode
  uneven?: boolean
  noMargin?: boolean
  singleMargin?: boolean
}

export const Grid: React.FunctionComponent<GridProps> = (props: GridProps) => {
  const childCount = React.Children.count(props.children);

  if (childCount > 4) {
    throw new Error('Grid can have a maximum of 4 children.');
  }

  if (childCount === 0) {
    throw new Error('Grid must have at least 1 child.');
  }

  if (props.uneven && childCount !== 2) {
    throw new Error('60/40 grid must have exactly 2 children.');
  }

  const names = classnames(
    b(),
    `${b(null, childCount.toString())}`,
    {
      [b(null, 'uneven')]: props.uneven,
      [b(null, 'no-margin')]: props.noMargin,
      [b(null, 'single-margin')]: props.singleMargin,
    },
  );

  return (
    <div className={names}>
      {props.children}
    </div>
  );
};

export interface ColProps {
  children?: React.ReactNode
  transparent?: boolean
  empty?: boolean
  unsupported?: boolean
}

export const Col: React.FunctionComponent<ColProps> = (props: ColProps) => {
  const names = classnames(b('col'), {
    [b('col', 'transparent')]: props.transparent,
    [b('col', 'unsupported')]: props.unsupported,
  });

  if (props.empty) {
    return <div className={names} />;
  }

  return (
    <div className={names}>
      <div className={b('col-pad')}>
        {props.children}
      </div>
    </div>
  );
};

