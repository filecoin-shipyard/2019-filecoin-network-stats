CREATE INDEX messages_method_idx ON messages(method);
CREATE INDEX messages_committed_sector_id ON messages((params->>0)) WHERE method = 'commitSector';