-- Security configurations

-- Disable connections to template1
REVOKE ALL ON DATABASE template1 FROM PUBLIC;

-- Logging and monitoring configuration
ALTER
SYSTEM SET log_connections = on;
ALTER
SYSTEM SET log_disconnections = on;
ALTER
SYSTEM SET log_statement = 'all';
