SET client_encoding = 'UTF8';

CREATE FUNCTION generate_duration_series(_interval interval, _granularity character varying) RETURNS TABLE(date bigint)
  LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY WITH series AS (
    SELECT extract(EPOCH FROM g.s)::bigint AS date
    FROM generate_series(date_trunc(_granularity, current_timestamp),
                         date_trunc(_granularity, current_timestamp - _interval),
                         -1 * (CONCAT('1', _granularity)::interval)) g (s))
    SELECT *
    FROM series s
    WHERE s.date >= (SELECT min(extract(EPOCH FROM date_trunc(_granularity, to_timestamp(b.ingested_at)) - CONCAT('1', _granularity)::interval)) FROM blocks b);
END;
$$;

CREATE FUNCTION materialize_disambiguator_key() RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.disambiguator_key := NEW.height || '-' || NEW.from_address || '-' || NEW.to_address || '-' || NEW.nonce;
  RETURN NEW;
END
$$;

CREATE FUNCTION process_messages() RETURNS trigger
  LANGUAGE plpgsql
AS $$
DECLARE
BEGIN
  IF NEW.method = 'addAsk' THEN
    INSERT INTO asks (message_id, price, expiry_length, expires_at)
    VALUES(NEW.id, (NEW.params->>0)::numeric, (NEW.params->>1)::integer, NEW.height + (NEW.params->>1)::bigint);
  END IF;

  RETURN NEW;
END;
$$;
SET default_tablespace = '';

SET default_with_oids = false;CREATE TABLE asks (
  id bigint NOT NULL,
  message_id bigint NOT NULL,
  price numeric(78,0) NOT NULL,
  expiry_length integer,
  expires_at bigint
);

CREATE SEQUENCE asks_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE asks_id_seq OWNED BY asks.id;
CREATE TABLE blocks (
  height bigint NOT NULL,
  miner character varying(41) NOT NULL,
  parent_weight bigint NOT NULL,
  ingested_at bigint NOT NULL,
  parent_tipset_hashes character varying[],
  tipset_hash character varying NOT NULL
);

CREATE TABLE coin_circulation_stats (
  coins_in_collateral numeric(78,0) NOT NULL,
  total_coins numeric(78,0) NOT NULL,
  ingested_at bigint NOT NULL
);

CREATE TABLE ip_to_locations (
  ip_from bigint NOT NULL,
  ip_to bigint NOT NULL,
  country_code character(2) NOT NULL,
  country_name character varying(64) NOT NULL,
  region_name character varying(128) NOT NULL,
  city_name character varying(128) NOT NULL,
  latitude real NOT NULL,
  longitude real NOT NULL
);

CREATE TABLE messages (
  id bigint NOT NULL,
  height bigint NOT NULL,
  tx_idx integer NOT NULL,
  gas_price numeric(78,0),
  gas_limit numeric(78,0),
  from_address character varying(41) NOT NULL,
  to_address character varying(41) NOT NULL,
  value numeric(78,0),
  method character varying,
  params jsonb,
  tipset_hash character varying,
  nonce bigint DEFAULT 0 NOT NULL,
  disambiguator_key character varying
);

CREATE SEQUENCE messages_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE messages_id_seq OWNED BY messages.id;

CREATE TABLE miner_counts (
  count integer,
  calculated_at bigint
);

CREATE TABLE miners (
  miner_address character varying(41) NOT NULL,
  amount numeric(78,0),
  updated_at bigint,
  power numeric(78,0)
);

CREATE TABLE network_usage_stats (
  total_committed_gb numeric,
  total_pledges_gb numeric,
  calculated_at bigint NOT NULL
);

CREATE TABLE token_address_stats (
  unique_address_count bigint NOT NULL,
  average_holdings bigint NOT NULL,
  ingested_at bigint NOT NULL
);

ALTER TABLE ONLY asks ALTER COLUMN id SET DEFAULT nextval('asks_id_seq'::regclass);
ALTER TABLE ONLY messages ALTER COLUMN id SET DEFAULT nextval('messages_id_seq'::regclass);
ALTER TABLE ONLY asks
  ADD CONSTRAINT asks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY blocks
  ADD CONSTRAINT blocks_pkey PRIMARY KEY (tipset_hash);
ALTER TABLE ONLY ip_to_locations
  ADD CONSTRAINT ip_to_locations_pkey PRIMARY KEY (ip_from, ip_to);
ALTER TABLE ONLY messages
  ADD CONSTRAINT messages_id_key UNIQUE (id);
ALTER TABLE ONLY messages
  ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY miners
  ADD CONSTRAINT pledges_pkey PRIMARY KEY (miner_address);

CREATE INDEX asks_message_id_index ON asks USING btree (message_id);
CREATE INDEX block_miner_idx ON blocks USING btree (miner);
CREATE INDEX blocks_ingested_at_idx ON blocks USING btree (ingested_at);
CREATE INDEX ip_to_locations_ip_from ON ip_to_locations USING btree (ip_from);
CREATE INDEX ip_to_locations_ip_to ON ip_to_locations USING btree (ip_to);
CREATE INDEX messages_committed_sector_id ON messages USING btree (((params ->> 0))) WHERE ((method)::text = 'commitSector'::text);
CREATE INDEX messages_disambiguator_key_idx ON messages USING btree (disambiguator_key);
CREATE INDEX messages_from_address_idx ON messages USING btree (from_address);
CREATE INDEX messages_height_idx ON messages USING btree (height);
CREATE INDEX messages_method_idx ON messages USING btree (method);
CREATE INDEX messages_nonce ON messages USING btree (nonce);
CREATE INDEX messages_to_address_idx ON messages USING btree (to_address);
CREATE INDEX miner_counts_calculated_at ON miner_counts USING btree (calculated_at);

CREATE TRIGGER materialize_disambiguator_key_trigger BEFORE INSERT ON messages FOR EACH ROW EXECUTE PROCEDURE materialize_disambiguator_key();
CREATE TRIGGER process_messages_trigger AFTER INSERT ON messages FOR EACH ROW EXECUTE PROCEDURE process_messages();

ALTER TABLE ONLY asks
  ADD CONSTRAINT asks_message_id_fkey FOREIGN KEY (message_id) REFERENCES messages(id);
ALTER TABLE ONLY messages
  ADD CONSTRAINT messages_tipset_hash_fkey FOREIGN KEY (tipset_hash) REFERENCES blocks(tipset_hash);
