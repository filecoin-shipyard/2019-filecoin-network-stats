CREATE OR REPLACE FUNCTION process_messages() RETURNS trigger AS $process_messages$
DECLARE
BEGIN
  IF NEW.method = 'addAsk' THEN
    INSERT INTO asks (message_id, price, expiry_length, expires_at)
    VALUES(NEW.id, (NEW.params->>0)::numeric, (NEW.params->>1)::integer, NEW.height + (NEW.params->>1)::bigint);
  END IF;

  RETURN NEW;
END;
$process_messages$ LANGUAGE plpgsql;

CREATE TRIGGER process_messages_trigger AFTER INSERT ON messages
  FOR EACH ROW EXECUTE PROCEDURE process_messages();