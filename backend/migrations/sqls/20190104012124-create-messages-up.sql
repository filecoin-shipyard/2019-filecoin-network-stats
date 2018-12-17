CREATE TABLE messages (
  id BIGSERIAL NOT NULL,
  height BIGINT NOT NULL REFERENCES blocks(height),
  tx_idx INT NOT NULL,
  gas_price DECIMAL(78,0),
  gas_limit DECIMAL(78,0),
  from_address VARCHAR(41) NOT NULL,
  to_address VARCHAR(41) NOT NULL,
  value DECIMAL(78,0),
  method VARCHAR,
  params JSONB,
  PRIMARY KEY (height, tx_idx),
  UNIQUE (id)
);