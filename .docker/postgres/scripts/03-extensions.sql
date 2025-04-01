-- Enabling extensions
CREATE
EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;
CREATE
EXTENSION IF NOT EXISTS pgaudit SCHEMA app_audit;
CREATE
EXTENSION IF NOT EXISTS pg_stat_statements SCHEMA extensions;
CREATE
EXTENSION IF NOT EXISTS table_log SCHEMA extensions;
CREATE
EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE
EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


-- Conditional management of extensions
DO
$$
BEGIN
		IF
EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pgjwt') THEN
				CREATE
EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions CASCADE;
END IF;
END $$;
