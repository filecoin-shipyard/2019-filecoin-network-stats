declare module 'react-timeago' {
  import * as React from 'react';

  interface TimeagoProps {
    date: Date | string | number
    formatter?: (value: number, unit: string, suffix: string) => string
  }

  const el: React.ComponentClass<TimeagoProps>;
  export default el;
}