-- Creation of dedicated schemas for logical separation
CREATE SCHEMA IF NOT EXISTS app_audit;
CREATE SCHEMA IF NOT EXISTS app_data;
CREATE SCHEMA IF NOT EXISTS app_config;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pgaudit;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements SCHEMA app_audit;
CREATE EXTENSION IF NOT EXISTS table_log;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;