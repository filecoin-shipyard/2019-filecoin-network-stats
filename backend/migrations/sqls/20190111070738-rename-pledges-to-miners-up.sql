ALTER TABLE pledges
  RENAME TO miners;
ALTER TABLE miners
  ADD COLUMN power DECIMAL(78, 0);

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
    VALUES ((SELECT SUM(miner.amount) FROM miners miner), (SELECT EXTRACT(EPOCH FROM date_trunc('hour', now()))));
  ELSE
    IF TG_OP = 'INSERT'
    THEN
      UPDATE total_storage_stats
      SET total_storage_gb = last_hour.total_storage_gb - NEW.amount
      WHERE id = last_hour.id;
    ELSE
      UPDATE total_storage_stats
      SET total_storage_gb = last_hour.total_storage_gb - OLD.amount + NEW.amount
      WHERE id = last_hour.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$calculate$
LANGUAGE plpgsql;
