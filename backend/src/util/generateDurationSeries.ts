import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';

export function generateDurationSeries (duration: ChartDuration): { durSeq: string, durBase: string, durInterval: string } {
  let durSeq;
  let durBase;
  let durInterval;

  switch (duration) {
    case ChartDuration.DAY:
      durSeq = `SELECT date
                FROM generate_duration_series(INTERVAL '24 hours', 'hour')`;
      durBase = 'hour';
      durInterval = '1 hour';
      break;
    case ChartDuration.WEEK:
      durSeq = `SELECT date
                FROM generate_duration_series(INTERVAL '7 days', 'day')`;
      durBase = 'day';
      durInterval = '1 day';
      break;
    case ChartDuration.MONTH:
      durSeq = `SELECT date
                FROM generate_duration_series(INTERVAL '30 days', 'day')`;
      durBase = 'day';
      durInterval = '30 days';
      break;
    case ChartDuration.ALL:
    case ChartDuration.YEAR:
      durSeq = `SELECT date
                FROM generate_duration_series(INTERVAL '12 months', 'month')`;
      durBase = 'month';
      durInterval = '1 month';
      break;
  }

  return {
    durSeq,
    durBase,
    durInterval,
  };
}