CREATE TABLE unique_messages (
  id           bigint                NOT NULL PRIMARY KEY,
  height       bigint                NOT NULL,
  tx_idx       integer               NOT NULL,
  gas_price    numeric(78, 0),
  gas_limit    numeric(78, 0),
  from_address character varying(41) NOT NULL,
  to_address   character varying(41) NOT NULL,
  value        numeric(78, 0),
  method       character varying,
  params       jsonb,
  tipset_hash  character varying,
  nonce        bigint DEFAULT 0      NOT NULL
);

CREATE INDEX unique_messages_height ON unique_messages (height);
CREATE INDEX unique_messages_method ON unique_messages (method);
CREATE INDEX unique_messages_from_address ON unique_messages (from_address);
CREATE INDEX unique_messages_to_address ON unique_messages (to_address);
CREATE INDEX unique_messages_committed_sector_id ON unique_messages USING btree (((params ->> 0))) WHERE ((method)::text = 'commitSector'::text);

CREATE OR REPLACE FUNCTION populate_unique_messages(last_id BIGINT) RETURNS int AS
$$
BEGIN
  WITH t AS (
    SELECT max(id) AS id, m.disambiguator_key
    FROM messages m
    WHERE m.method != 'createChannel'
      AND m.id > last_id
    GROUP BY m.disambiguator_key
  ),
       msgs AS (
         SELECT m.*
         FROM t
                JOIN messages m ON m.id = t.id
       )
  INSERT
  INTO unique_messages(id,
                       height,
                       tx_idx,
                       gas_price,
                       gas_limit,
                       from_address,
                       to_address,
                       value,
                       method,
                       params,
                       tipset_hash,
                       nonce)
  SELECT m.id,
         m.height,
         m.tx_idx,
         m.gas_price,
         m.gas_limit,
         m.from_address,
         m.to_address,
         m.value,
         m.method,
         m.params,
         m.tipset_hash,
         m.nonce
  FROM msgs m;

  RETURN last_id;
END;
$$
  LANGUAGE plpgsql;