import { z, type ZodObject, type ZodRawShape, type ZodError, type TypeOf } from "zod";
import dotenv from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";
import * as process from "node:process";

import { createLogger } from "@opstd/logger";
import { BaseSchema, type NodeEnv, type AppMode } from "./schemas/base";
export { DatabaseSchema } from "./schemas/database";

const logger = createLogger({
	serviceName: "env-validator",
	environment: process.env.NODE_ENV || "development",
	logLevel: "info",
});

type EnvValidationOptions = {
	/**
	 * Custom path for .env file
	 */
	envPath?: string;

	/**
	 * Prefix for service-specific environment variables
	 */
	servicePrefix?: string;

	/**
	 * Debug logging options
	 */
	debug?: boolean;

	/**
	 * Application mode
	 */
	appMode?: AppMode;
};

class EnvValidator {
	private baseSchema: ZodObject<ZodRawShape>;
	private options: Required<EnvValidationOptions>;
	private validatedEnv!: TypeOf<ZodObject<ZodRawShape>>;

	constructor(
		schema: ZodObject<ZodRawShape> | undefined = undefined,
		options: EnvValidationOptions = {},
	) {
		// Set default APP_MODE
		const defaultAppMode: AppMode = "development";
		process.env.APP_MODE = process.env.APP_MODE || options.appMode || defaultAppMode;

		// Prepare options
		this.options = {
			envPath: path.resolve(process.cwd(), ".env"),
			servicePrefix: "",
			debug: false,
			appMode: process.env.APP_MODE as AppMode,
			...options,
		};

		this.baseSchema = schema ? BaseSchema.merge(schema) : BaseSchema;

		// Debug logging
		this.debugLog("Initial configuration:", {
			processAppMode: process.env.APP_MODE,
			optionsAppMode: this.options.appMode,
		});

		// Immediate validation
		this.validate();
	}

	/**
	 * Validate environment variables
	 */
	validate(): z.infer<typeof this.baseSchema> {
		// Load .env files
		this.loadEnvFiles();

		// Prepare variables
		const envVars = this.prepareEnvVars();

		// Validation
		const result = this.baseSchema.safeParse(envVars);

		if (!result.success) {
			this.handleValidationError(result.error);
		}

		// Update environment
		this.validatedEnv = result.data as z.infer<typeof this.baseSchema>;
		Object.assign(process.env, this.validatedEnv);

		return this.validatedEnv;
	}

	/**
	 * Getter for validated environment variables
	 */
	get env(): z.infer<typeof this.baseSchema> {
		if (!this.validatedEnv) {
			throw new Error("Env not validated yet. Call validate() first.");
		}
		return this.validatedEnv;
	}

	/**
	 * Dynamic .env file loading
	 */
	private loadEnvFiles(): void {
		const { envPath, appMode } = this.options;
		const envFiles = [`.env.${appMode}`, `.env.${appMode}.local`, ".env.local", ".env"];

		for (const file of envFiles) {
			const filePath = path.resolve(path.dirname(envPath), file);

			if (fs.existsSync(filePath)) {
				this.debugLog(`Loading env file: ${filePath}`);
				dotenv.config({ path: filePath });
			}
		}
	}

	/**
	 * Prepare environment variables
	 */
	private prepareEnvVars(): Record<string, string> {
		const { servicePrefix, appMode } = this.options;
		const envVars: Record<string, string> = {
			NODE_ENV: (process.env.NODE_ENV ?? "development").toLowerCase(),
			APP_MODE: (process.env.APP_MODE ?? appMode ?? "development").toLowerCase(),
		};

		// Handle variables with specific prefix
		for (const [key, value] of Object.entries(process.env)) {
			const normalizedKey = key.toUpperCase();

			if (servicePrefix && key.startsWith(servicePrefix)) {
				const cleanKey = normalizedKey.replace(servicePrefix.toUpperCase(), "");
				envVars[cleanKey] = value || "";
			} else if (!servicePrefix) {
				envVars[normalizedKey] = value || "";
			}
		}

		return envVars;
	}

	/**
	 * Handle validation errors
	 */
	private handleValidationError(error: ZodError): never {
		const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");

		logger.error(`Environment validation error: ${errorMessages}`);
		this.debugLog("Full error", error.errors);

		process.exit(1);
	}

	/**
	 * Conditional debug logging
	 */
	private debugLog(message: string, ...args: unknown[]): void {
		if (this.options.debug) {
			logger.debug(`[EnvValidator Debug] ${message}`, ...args);
		}
	}

	/**
	 * Utility to get current mode
	 */
	getAppMode(): AppMode {
		return this.options.appMode;
	}

	/**
	 * Check specific mode
	 */
	isAppMode(mode: AppMode): boolean {
		return this.options.appMode === mode;
	}
}

export { EnvValidator, z, type NodeEnv, type AppMode };
