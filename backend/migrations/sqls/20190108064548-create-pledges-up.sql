CREATE TABLE pledges (
  miner_address VARCHAR(41) PRIMARY KEY,
  amount DECIMAL(78, 0),
  updated_at BIGINT
);