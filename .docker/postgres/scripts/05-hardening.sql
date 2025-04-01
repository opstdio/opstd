-- Disable connections to template1
REVOKE ALL ON DATABASE template1 FROM PUBLIC;

-- Configure logging and monitoring
ALTER
SYSTEM SET log_connections = on;
ALTER
SYSTEM SET log_disconnections = on;
ALTER
SYSTEM SET log_statement = 'all';
