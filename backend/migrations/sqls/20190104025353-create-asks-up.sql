CREATE TABLE asks (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id),
  price DECIMAL(78, 0) NOT NULL,
  expiry_length INT,
  expires_at BIGINT
);

CREATE INDEX asks_message_id_index ON asks(message_id);