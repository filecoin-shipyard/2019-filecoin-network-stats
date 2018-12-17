declare module 'react-timeago' {
  import * as React from 'react';

  interface TimeagoProps {
    date: Date | string | number
  }

  const el: React.ComponentClass<TimeagoProps>;
  export default el;
}