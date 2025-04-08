-- Basic configurations and initial database settings

-- Session settings
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Schema creation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS migrations;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS app_audit;
CREATE SCHEMA IF NOT EXISTS app_data;
CREATE SCHEMA IF NOT EXISTS app_config;

-- Role configuration
-- Basic roles for connection
DO $$
	BEGIN
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
			CREATE ROLE postgres WITH SUPERUSER LOGIN;
		END IF;
	END $$;

DO $$
	BEGIN
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
			CREATE ROLE app_admin WITH SUPERUSER LOGIN;
		END IF;
	END $$;


CREATE ROLE app_connect WITH LOGIN NOINHERIT;
CREATE ROLE app_read_only WITH LOGIN NOINHERIT;
CREATE ROLE app_writer WITH LOGIN NOINHERIT;
CREATE ROLE app_auditor WITH LOGIN NOINHERIT;

-- Authentication roles
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;

CREATE USER authenticator NOINHERIT;
GRANT anon, authenticated, service_role, app_admin TO authenticator;

-- Create an event trigger function
CREATE OR REPLACE FUNCTION pg_catalog.pgrst_watch() RETURNS event_trigger
	LANGUAGE plpgsql
AS $$
BEGIN
	NOTIFY pgrst, 'reload schema';
END;
$$;

-- This event trigger will fire after every ddl_command_end event
CREATE EVENT TRIGGER pgrst_watch
	ON ddl_command_end
EXECUTE PROCEDURE pg_catalog.pgrst_watch();
