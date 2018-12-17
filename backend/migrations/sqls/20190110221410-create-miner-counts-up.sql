CREATE TABLE miner_counts (
  count INT,
  calculated_at BIGINT
);

CREATE INDEX miner_counts_calculated_at ON miner_counts(calculated_at);