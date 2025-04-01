-- Definition of permissions for roles

-- Basic permissions for connection
GRANT
CONNECT
ON DATABASE postgres TO app_connect;
GRANT USAGE ON SCHEMA
app_data TO app_base_access;

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

-- Permissions for auditor (read-only on audit schemas)
GRANT
SELECT
ON ALL TABLES IN SCHEMA app_audit TO app_auditor;