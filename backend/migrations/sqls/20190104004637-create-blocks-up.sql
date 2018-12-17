CREATE TABLE blocks (
  height BIGINT NOT NULL PRIMARY KEY,
  cid VARCHAR(52) NOT NULL,
  miner VARCHAR(41) NOT NULL,
  parent_weight BIGINT NOT NULL,
  nonce BIGINT NOT NULL,
  ingested_at BIGINT NOT NULL,
  UNIQUE (cid)
);