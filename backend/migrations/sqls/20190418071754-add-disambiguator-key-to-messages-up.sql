ALTER TABLE messages
  ADD COLUMN disambiguator_key VARCHAR;
CREATE INDEX messages_disambiguator_key_idx ON messages (disambiguator_key);

CREATE OR REPLACE FUNCTION materialize_disambiguator_key()
  RETURNS trigger AS
$f$
BEGIN
  NEW.disambiguator_key := NEW.height || '-' || NEW.from_address || '-' || NEW.to_address || '-' || NEW.nonce;
  RETURN NEW;
END
$f$
  LANGUAGE plpgsql;

CREATE TRIGGER materialize_disambiguator_key_trigger
  BEFORE INSERT
  ON messages
  FOR EACH ROW
EXECUTE PROCEDURE materialize_disambiguator_key();

DROP MATERIALIZED VIEW unique_messages;

CREATE MATERIALIZED VIEW unique_messages AS (
  WITH t AS (
    SELECT max(id) AS id, m.disambiguator_key
    FROM messages m
    WHERE m.method != 'createChannel'
    GROUP BY m.disambiguator_key
    )
    SELECT m.*
    FROM t
           JOIN messages m ON m.id = t.id
) WITH DATA;

SELECT current_timestamp AS ts;