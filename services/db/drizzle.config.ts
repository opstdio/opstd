import { EnvValidator, DatabaseSchema, z } from "@opstd/env-validator";
import type { Config } from "drizzle-kit";
import * as process from "node:process";

const envValidator = new EnvValidator(DatabaseSchema.innerType());

const dbEnv = DatabaseSchema.parse(envValidator.env);
export default {
	schema: "./schemas",
	dialect: "postgresql",
	dbCredentials: {
		url: dbEnv.DATABASE_URL,
	},
	schemaFilter: ["public"],
} satisfies Config;
