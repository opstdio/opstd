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

CREATE OR REPLACE FUNCTION add_moddatetime_triggers()
	RETURNS void AS $$
DECLARE
	r RECORD;
	trigger_count INTEGER := 0;
	trigger_exists BOOLEAN;
BEGIN
	-- Attempt to create moddatetime extension
	BEGIN
		CREATE EXTENSION IF NOT EXISTS "moddatetime";
	EXCEPTION
		WHEN DUPLICATE_OBJECT THEN
        -- The extension exist do nothing
        NULL;
    WHEN OTHERS THEN
		CREATE OR REPLACE FUNCTION moddatetime() RETURNS trigger LANGUAGE plpgsql AS $moddatetime$
		DECLARE
			colname name;
		BEGIN
			IF (TG_NARGS = 1) THEN
				colname = TG_ARGV[0];
			ELSE
				RAISE EXCEPTION 'moddatetime(colname) requires one argument';
			END IF;

			RETURN json_populate_record(NEW, json_build_object(colname, NOW()));
		END;
		$moddatetime$;
	END;

	-- Iterate through all tables with 'updated_at' column
	FOR r IN (
		SELECT
			table_schema,
			table_name
		FROM information_schema.columns
		WHERE
			column_name = 'updated_at'
			AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
			AND table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_temp')
	)
		LOOP
			BEGIN
				-- Check if trigger already exists
				EXECUTE format('
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.triggers
                    WHERE event_object_schema = %L
                    AND event_object_table = %L
                    AND trigger_name = %L
                )
            ', r.table_schema, r.table_name, 'zzzz_moddatetime_' || r.table_name)
					INTO trigger_exists;

				-- Create trigger only if it doesn't exist
				IF NOT trigger_exists THEN
					EXECUTE format('
                    CREATE TRIGGER zzzz_moddatetime_%I
                    BEFORE UPDATE ON %I.%I
                    FOR EACH ROW
                    WHEN (NEW.updated_at IS NULL OR NEW.updated_at = OLD.updated_at)
                    EXECUTE FUNCTION moddatetime(''updated_at'');
                ',
												 r.table_name, r.table_schema, r.table_name);

					trigger_count := trigger_count + 1;
					RAISE NOTICE 'Added conditional moddatetime trigger to %.%', r.table_schema, r.table_name;
				ELSE
					RAISE NOTICE 'Trigger already exists for %.%', r.table_schema, r.table_name;
				END IF;

			EXCEPTION WHEN OTHERS THEN
				RAISE NOTICE 'Failed to add trigger to %.%: %', r.table_schema, r.table_name, SQLERRM;
			END;
		END LOOP;

	RAISE NOTICE 'Total moddatetime triggers added: %', trigger_count;
END;
$$ LANGUAGE plpgsql;


