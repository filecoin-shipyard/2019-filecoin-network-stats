CREATE OR REPLACE FUNCTION process_messages() RETURNS trigger
  LANGUAGE plpgsql
AS $$
DECLARE
BEGIN
  IF NEW.method = 'addAsk' THEN
    INSERT INTO asks (message_id, price, expiry_length, expires_at)
    VALUES(NEW.id, (NEW.params->>0)::numeric, (NEW.params->>1)::numeric, NEW.height + (NEW.params->>1)::bigint);
  END IF;

  RETURN NEW;
END;
$$;
SET default_tablespace = '';