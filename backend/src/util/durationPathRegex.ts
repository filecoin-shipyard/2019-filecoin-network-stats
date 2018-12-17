import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';

export const durationPathRegex = `(${ChartDuration.ALL}|${ChartDuration.DAY}|${ChartDuration.WEEK}|${ChartDuration.MONTH}|${ChartDuration.YEAR})`;

export default durationPathRegex;