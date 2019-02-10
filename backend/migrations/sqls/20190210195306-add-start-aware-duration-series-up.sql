/*
This function generates a series of dates based on the provided interval
and granularity. It is aware of the date of the first block ingested,
and uses that to avoid creating dates in the sequence prior
to the dashboard's deployment.
*/

CREATE OR REPLACE FUNCTION generate_duration_series(_interval INTERVAL, _granularity VARCHAR)
  RETURNS TABLE(date BIGINT) AS $$
BEGIN
  RETURN QUERY WITH series AS (
      SELECT extract(EPOCH FROM g.s)::bigint AS date
      FROM generate_series(date_trunc(_granularity, current_timestamp),
                           date_trunc(_granularity, current_timestamp - _interval),
                           -1 * (CONCAT('1', _granularity)::interval)) g (s))
  SELECT *
  FROM series s
  WHERE s.date >= (SELECT min(extract(EPOCH FROM date_trunc(_granularity, to_timestamp(b.ingested_at)) - CONCAT('1', _granularity)::interval)) FROM blocks b);
END;
$$
LANGUAGE plpgsql;