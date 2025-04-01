-- Definition of permissions for roles

-- Basic connection permissions
GRANT
CONNECT
ON DATABASE postgres TO app_connect;
GRANT USAGE ON SCHEMA
app_data TO app_connect;

-- Permissions for read-only role
GRANT
SELECT
ON ALL TABLES IN SCHEMA app_data TO app_read_only;
GRANT
SELECT
ON ALL SEQUENCES IN SCHEMA app_data TO app_read_only;

-- Permissions for writer role
GRANT
INSERT,
UPDATE,
DELETE
ON ALL TABLES IN SCHEMA app_data TO app_writer;
GRANT
USAGE
ON
ALL
SEQUENCES IN SCHEMA app_data TO app_writer;

-- Permissions for admin role
GRANT ALL PRIVILEGES ON SCHEMA
app_data TO app_admin;
GRANT ALL PRIVILEGES ON ALL
TABLES IN SCHEMA app_data TO app_admin;
GRANT ALL PRIVILEGES ON ALL
SEQUENCES IN SCHEMA app_data TO app_admin;

-- Permissions for auditor role
GRANT
SELECT
ON ALL TABLES IN SCHEMA app_audit TO app_auditor;

-- Public permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;


GRANT USAGE ON SCHEMA
extensions TO postgres, anon, authenticated, service_role;
