import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { createLogger } from "@opstd/logger";
import { pinoLogger } from "./middlewares/pino";
import { auth } from "./auth";
import dotenv from "dotenv";
import process from "node:process";
import { hostname } from "node:os";
import { requestId } from "hono/request-id";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, up } from "@opstd/db";
import { z, EnvValidator } from "@opstd/env-validator";
import path from "node:path";

dotenv.config();

const envValidator = new EnvValidator(
	z.object({
		PORT: z.coerce.number().default(4001),
	}),
);
envValidator.validate();

const customLogger = createLogger({
	serviceName: "auth-service",
	environment: process.env.NODE_ENV || "development",
	logLevel: "info",
});

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>();

// Configurazione CORS
app.use(
	"*",
	cors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		credentials: true,
	}),
);
app.use(requestId());
app.use(pinoLogger(customLogger));
app.get("/health", (c) => {
	return c.json({
		status: true,
		service: "auth-service",
		pid: process.pid,
		uptime: process.uptime(),
		memory: process.memoryUsage(),
		env: envValidator.env.NODE_ENV,
		mode: envValidator.env.APP_MODE,
		hostname: hostname(),
		port: envValidator.env.PORT,
	});
});
app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

async function migrateDatabase() {
	await migrate(db, {
		migrationsFolder: path.resolve(process.cwd(), "drizzle"),
		migrationsSchema: "migrations",
		migrationsTable: "auth_migrations",
	})
	await up(db);
	customLogger.info(`Database Migration completed`);
}

migrateDatabase()
	.catch((error) => {
		customLogger.error(`Database Migration error`, error);
		process.exit(1);
	})
	.finally(() => {
		serve({
			fetch: app.fetch,
			port: envValidator.env.PORT,
		});
		customLogger.debug(`Running on port ${envValidator.env.PORT}`);
	});
