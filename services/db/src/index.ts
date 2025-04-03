import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import { DatabaseSchema, EnvValidator, z } from "@opstd/env-validator";

const envValidator = new EnvValidator(DatabaseSchema.innerType());

const dbEnv = DatabaseSchema.parse(envValidator.env);

const pool = new Pool({
	connectionString: dbEnv.DATABASE_URL,
});

export const db = drizzle(pool, {
	logger: true,
});

