CREATE TABLE total_storage_stats (
  id               BIGSERIAL PRIMARY KEY,
  total_storage_gb BIGINT NOT NULL,
  calculated_at    BIGINT NOT NULL
);

CREATE OR REPLACE FUNCTION calculate_total_storage_stats()
  RETURNS trigger AS $calculate$
DECLARE
  last_hour total_storage_stats;
BEGIN
  -- do not recalculate if the numbers are the same
  IF TG_OP = 'UPDATE' AND NEW.amount = OLD.amount
  THEN
    RETURN NEW;
  END IF;

  SELECT *
  FROM total_storage_stats
  WHERE to_timestamp(calculated_at) > current_timestamp - INTERVAL '1 hour' INTO last_hour;
  IF (SELECT last_hour.id IS NULL)
  THEN
    INSERT INTO total_storage_stats (total_storage_gb, calculated_at)
    VALUES ((SELECT SUM(amount) FROM pledges), (SELECT EXTRACT(EPOCH FROM date_trunc('hour', now()))));
  ELSE
    UPDATE total_storage_stats
    SET total_storage_gb = last_hour.total_storage_gb - OLD.amount + NEW.amount
    WHERE id = last_hour.id;
  END IF;

  RETURN NEW;
END;
$calculate$
LANGUAGE plpgsql;

CREATE TRIGGER calculate_total_storage_stats_trigger
  AFTER INSERT OR UPDATE
  ON pledges
  FOR EACH ROW EXECUTE PROCEDURE calculate_total_storage_stats();
