ALTER TABLE messages
  ADD COLUMN nonce BIGINT NOT NULL DEFAULT 0;
CREATE INDEX messages_nonce ON messages (nonce);

CREATE VIEW unique_messages AS
SELECT DISTINCT ON (height, from_address, to_address, nonce) *
FROM messages;