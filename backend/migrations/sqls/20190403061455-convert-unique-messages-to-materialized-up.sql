DROP VIEW unique_messages;

CREATE MATERIALIZED VIEW unique_messages AS
SELECT DISTINCT ON (height, from_address, to_address, nonce) *
FROM messages WITH DATA;

CREATE UNIQUE INDEX unique_messages_id on unique_messages(id);