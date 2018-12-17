export enum ChartDuration {
  DAY = '24h',
  WEEK = '1w',
  MONTH = '1m',
  YEAR = '1y',
  ALL = 'all'
}

export function chartDurationFromString (str: string) {
  switch (str) {
    case '24h':
      return ChartDuration.DAY;
    case '1w':
      return ChartDuration.WEEK;
    case '1m':
      return ChartDuration.MONTH;
    case '1y':
      return ChartDuration.YEAR;
    case 'all':
      return ChartDuration.ALL;
    default:
      throw new Error('invalid duration string');
  }
}

export default ChartDuration;