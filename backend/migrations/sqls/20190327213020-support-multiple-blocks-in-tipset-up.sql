ALTER TABLE messages DROP CONSTRAINT messages_height_fkey;
ALTER TABLE blocks ADD COLUMN tipset_hash VARCHAR;
ALTER TABLE blocks DROP CONSTRAINT blocks_pkey;
ALTER TABLE blocks RENAME COLUMN parent_hashes TO parent_tipset_hashes;
ALTER TABLE blocks DROP COLUMN blocks_in_tipset;
ALTER TABLE blocks ADD PRIMARY KEY(tipset_hash);
ALTER TABLE messages ADD COLUMN tipset_hash VARCHAR REFERENCES blocks(tipset_hash);
ALTER TABLE messages DROP CONSTRAINT messages_pkey;
ALTER TABLE messages ADD PRIMARY KEY (id);