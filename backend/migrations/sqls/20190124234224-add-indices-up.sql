CREATE INDEX blocks_ingested_at_idx
  ON blocks (ingested_at);

CREATE INDEX messages_height_idx
  ON messages (height);
CREATE INDEX messages_from_address_idx
  ON messages (from_address);
CREATE INDEX messages_to_address_idx
  ON messages (to_address);