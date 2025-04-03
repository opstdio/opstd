import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import { DatabaseSchema, EnvValidator, z } from "@opstd/env-validator";
import { sql } from "drizzle-orm";

const envValidator = new EnvValidator(DatabaseSchema.innerType());
envValidator.validate();

const dbEnv = DatabaseSchema.parse(envValidator.env);

const pool = new Pool({
	connectionString: dbEnv.DATABASE_URL,
});

export const db:NodePgDatabase = drizzle(pool, {
	logger: envValidator.env.APP_MODE !== "production",
});

export async function up(db: NodePgDatabase): Promise<void> {
	await db.execute(sql`SELECT add_moddatetime_triggers();`);
}
