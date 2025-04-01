-- Creation of roles with minimal and specific privileges
-- Base role for connection
CREATE ROLE app_connect WITH LOGIN NOINHERIT;

-- Specific roles for different access levels
CREATE ROLE app_read_only WITH LOGIN NOINHERIT;
CREATE ROLE app_writer WITH LOGIN NOINHERIT;
CREATE ROLE app_admin WITH LOGIN NOINHERIT CREATEROLE;

-- Role for read-only access to sensitive data
CREATE ROLE app_auditor WITH LOGIN NOINHERIT;

-- Group role for controlled inheritance
CREATE ROLE app_base_access;
