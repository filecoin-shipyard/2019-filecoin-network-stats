import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';

export function generateDurationSeries(duration: ChartDuration): {durSeq: string, durBase: string, durInterval: string} {
  let durSeq;
  let durBase;
  let durInterval;

  switch (duration) {
    case ChartDuration.DAY:
      durSeq = `SELECT extract(EPOCH FROM g.s) AS date
                  FROM generate_series(date_trunc('hour', current_timestamp),
                                       date_trunc('hour', current_timestamp - INTERVAL '24 hours'),
                                       -'1 hour'::interval) g (s)`;
      durBase = 'hour';
      durInterval = '1 hour';
      break;
    case ChartDuration.WEEK:
      durSeq = `SELECT extract(EPOCH FROM g.s) AS date
                  FROM generate_series(date_trunc('day', current_timestamp),
                                       date_trunc('day', current_timestamp - INTERVAL '7 days'),
                                       -'1 day'::interval) g (s)`;
      durBase = 'day';
      durInterval = '1 day';
      break;
    case ChartDuration.MONTH:
      durSeq = `SELECT extract(EPOCH FROM g.s) AS date
                  FROM generate_series(date_trunc('day', current_timestamp),
                                       date_trunc('day', current_timestamp - INTERVAL '30 days'),
                                       -'1 day'::interval) g (s)`;
      durBase = 'day';
      durInterval = '30 days';
      break;
    case ChartDuration.ALL:
    case ChartDuration.YEAR:
      durSeq = `SELECT extract(EPOCH FROM g.s) AS date
                  FROM generate_series(date_trunc('month', current_timestamp),
                                       date_trunc('month', current_timestamp - INTERVAL '12 months'),
                                       -'1 month'::interval) g (s)`;
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