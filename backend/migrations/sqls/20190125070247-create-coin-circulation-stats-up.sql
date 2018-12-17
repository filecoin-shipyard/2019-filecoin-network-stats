CREATE TABLE coin_circulation_stats (
  coins_in_collateral NUMERIC(78, 0) NOT NULL,
  total_coins NUMERIC(78, 0) NOT NULL,
  ingested_at BIGINT NOT NULL
);