--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: generate_duration_series(interval, character varying); Type: FUNCTION; Schema: public; Owner: stats
--

CREATE FUNCTION public.generate_duration_series(_interval interval, _granularity character varying) RETURNS TABLE(date bigint)
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


ALTER FUNCTION public.generate_duration_series(_interval interval, _granularity character varying) OWNER TO stats;

--
-- Name: materialize_disambiguator_key(); Type: FUNCTION; Schema: public; Owner: stats
--

CREATE FUNCTION public.materialize_disambiguator_key() RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.disambiguator_key := NEW.height || '-' || NEW.from_address || '-' || NEW.to_address || '-' || NEW.nonce;
  RETURN NEW;
END
$$;


ALTER FUNCTION public.materialize_disambiguator_key() OWNER TO stats;

--
-- Name: process_messages(); Type: FUNCTION; Schema: public; Owner: stats
--

CREATE FUNCTION public.process_messages() RETURNS trigger
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


ALTER FUNCTION public.process_messages() OWNER TO stats;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: asks; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.asks (
  id bigint NOT NULL,
  message_id bigint NOT NULL,
  price numeric(78,0) NOT NULL,
  expiry_length integer,
  expires_at bigint
);


ALTER TABLE public.asks OWNER TO stats;

--
-- Name: asks_id_seq; Type: SEQUENCE; Schema: public; Owner: stats
--

CREATE SEQUENCE public.asks_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER TABLE public.asks_id_seq OWNER TO stats;

--
-- Name: asks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: stats
--

ALTER SEQUENCE public.asks_id_seq OWNED BY public.asks.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.blocks (
  height bigint NOT NULL,
  miner character varying(41) NOT NULL,
  parent_weight bigint NOT NULL,
  nonce bigint NOT NULL,
  ingested_at bigint NOT NULL,
  parent_tipset_hashes character varying[],
  tipset_hash character varying NOT NULL
);


ALTER TABLE public.blocks OWNER TO stats;

--
-- Name: coin_circulation_stats; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.coin_circulation_stats (
  coins_in_collateral numeric(78,0) NOT NULL,
  total_coins numeric(78,0) NOT NULL,
  ingested_at bigint NOT NULL
);


ALTER TABLE public.coin_circulation_stats OWNER TO stats;

--
-- Name: ip_to_locations; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.ip_to_locations (
  ip_from bigint NOT NULL,
  ip_to bigint NOT NULL,
  country_code character(2) NOT NULL,
  country_name character varying(64) NOT NULL,
  region_name character varying(128) NOT NULL,
  city_name character varying(128) NOT NULL,
  latitude real NOT NULL,
  longitude real NOT NULL
);


ALTER TABLE public.ip_to_locations OWNER TO stats;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.messages (
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


ALTER TABLE public.messages OWNER TO stats;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: stats
--

CREATE SEQUENCE public.messages_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO stats;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: stats
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.migrations (
  id integer NOT NULL,
  name character varying(255) NOT NULL,
  run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations OWNER TO stats;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: stats
--

CREATE SEQUENCE public.migrations_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO stats;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: stats
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: miner_counts; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.miner_counts (
  count integer,
  calculated_at bigint
);


ALTER TABLE public.miner_counts OWNER TO stats;

--
-- Name: miners; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.miners (
  miner_address character varying(41) NOT NULL,
  amount numeric(78,0),
  updated_at bigint,
  power numeric(78,0)
);


ALTER TABLE public.miners OWNER TO stats;

--
-- Name: network_usage_stats; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.network_usage_stats (
  total_committed_gb numeric,
  total_pledges_gb numeric,
  calculated_at bigint NOT NULL
);


ALTER TABLE public.network_usage_stats OWNER TO stats;

--
-- Name: token_address_stats; Type: TABLE; Schema: public; Owner: stats
--

CREATE TABLE public.token_address_stats (
  unique_address_count bigint NOT NULL,
  average_holdings bigint NOT NULL,
  ingested_at bigint NOT NULL
);


ALTER TABLE public.token_address_stats OWNER TO stats;

--
-- Name: unique_messages; Type: MATERIALIZED VIEW; Schema: public; Owner: stats
--

CREATE MATERIALIZED VIEW public.unique_messages AS
  WITH t AS (
    SELECT max(m_1.id) AS id,
           m_1.disambiguator_key
    FROM public.messages m_1
    WHERE ((m_1.method)::text <> 'createChannel'::text)
    GROUP BY m_1.disambiguator_key
    )
    SELECT m.id,
           m.height,
           m.tx_idx,
           m.gas_price,
           m.gas_limit,
           m.from_address,
           m.to_address,
           m.value,
           m.method,
           m.params,
           m.tipset_hash,
           m.nonce,
           m.disambiguator_key
    FROM (t
           JOIN public.messages m ON ((m.id = t.id)))
  WITH NO DATA;


ALTER TABLE public.unique_messages OWNER TO stats;

--
-- Name: asks id; Type: DEFAULT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.asks ALTER COLUMN id SET DEFAULT nextval('public.asks_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: asks asks_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.asks
  ADD CONSTRAINT asks_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.blocks
  ADD CONSTRAINT blocks_pkey PRIMARY KEY (tipset_hash);


--
-- Name: ip_to_locations ip_to_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.ip_to_locations
  ADD CONSTRAINT ip_to_locations_pkey PRIMARY KEY (ip_from, ip_to);


--
-- Name: messages messages_id_key; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.messages
  ADD CONSTRAINT messages_id_key UNIQUE (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.messages
  ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.migrations
  ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: miners pledges_pkey; Type: CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.miners
  ADD CONSTRAINT pledges_pkey PRIMARY KEY (miner_address);


--
-- Name: asks_message_id_index; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX asks_message_id_index ON public.asks USING btree (message_id);


--
-- Name: block_miner_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX block_miner_idx ON public.blocks USING btree (miner);


--
-- Name: blocks_ingested_at_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX blocks_ingested_at_idx ON public.blocks USING btree (ingested_at);


--
-- Name: ip_to_locations_ip_from; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX ip_to_locations_ip_from ON public.ip_to_locations USING btree (ip_from);


--
-- Name: ip_to_locations_ip_to; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX ip_to_locations_ip_to ON public.ip_to_locations USING btree (ip_to);


--
-- Name: messages_committed_sector_id; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_committed_sector_id ON public.messages USING btree (((params ->> 0))) WHERE ((method)::text = 'commitSector'::text);


--
-- Name: messages_disambiguator_key_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_disambiguator_key_idx ON public.messages USING btree (disambiguator_key);


--
-- Name: messages_from_address_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_from_address_idx ON public.messages USING btree (from_address);


--
-- Name: messages_height_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_height_idx ON public.messages USING btree (height);


--
-- Name: messages_method_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_method_idx ON public.messages USING btree (method);


--
-- Name: messages_nonce; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_nonce ON public.messages USING btree (nonce);


--
-- Name: messages_to_address_idx; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX messages_to_address_idx ON public.messages USING btree (to_address);


--
-- Name: miner_counts_calculated_at; Type: INDEX; Schema: public; Owner: stats
--

CREATE INDEX miner_counts_calculated_at ON public.miner_counts USING btree (calculated_at);


--
-- Name: unique_messages_id; Type: INDEX; Schema: public; Owner: stats
--

CREATE UNIQUE INDEX unique_messages_id ON public.unique_messages USING btree (id);


--
-- Name: messages materialize_disambiguator_key_trigger; Type: TRIGGER; Schema: public; Owner: stats
--

CREATE TRIGGER materialize_disambiguator_key_trigger BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE PROCEDURE public.materialize_disambiguator_key();


--
-- Name: messages process_messages_trigger; Type: TRIGGER; Schema: public; Owner: stats
--

CREATE TRIGGER process_messages_trigger AFTER INSERT ON public.messages FOR EACH ROW EXECUTE PROCEDURE public.process_messages();


--
-- Name: asks asks_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.asks
  ADD CONSTRAINT asks_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id);


--
-- Name: messages messages_tipset_hash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stats
--

ALTER TABLE ONLY public.messages
  ADD CONSTRAINT messages_tipset_hash_fkey FOREIGN KEY (tipset_hash) REFERENCES public.blocks(tipset_hash);


--
-- PostgreSQL database dump complete
--

