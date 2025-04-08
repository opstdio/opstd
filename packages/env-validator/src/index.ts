import { z, type ZodObject, type ZodRawShape, type ZodError, type TypeOf } from "zod";
import dotenv from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";
import * as process from "node:process";

import { createLogger } from "@opstd/logger";
import { BaseSchema, type NodeEnv, type AppMode } from "./schemas/base";
export { DatabaseSchema } from "./schemas/database";

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

	/**
	 * Custom error handler
	 */
	onValidationError?: (error: ZodError) => void;
};

class EnvValidator {
	private baseSchema: ZodObject<ZodRawShape>;
	private options: Required<EnvValidationOptions>;
	private logger;
	private validatedEnv!: TypeOf<ZodObject<ZodRawShape>>;

	constructor(
		schema: ZodObject<ZodRawShape> | undefined = undefined,
		options: EnvValidationOptions = {},
	) {
		// Initialize options
		this.options = {
			envPath: path.resolve(process.cwd(), ".env"),
			servicePrefix: "",
			debug: false,
			appMode: "development",
			onValidationError: this.defaultErrorHandler.bind(this),
			...options,
		};

		// Initialize logger with default environment
		const nodeEnv = process.env.NODE_ENV?.toLowerCase();
		const validNodeEnv =
			nodeEnv === "development" || nodeEnv === "production" || nodeEnv === "test"
				? nodeEnv
				: "development";

		this.logger = createLogger({
			serviceName: "env-validator",
			environment: validNodeEnv,
			logLevel: this.options.debug ? "debug" : "info",
			prettyPrint: true,
			enableSourceLocation: true,
		});

		// Debug logging for initial state
		this.debugLog("Initial environment state:", process.env);

		// Load environment files first
		this.loadEnvFiles();

		// Merge schemas - base schema takes precedence for core env vars
		this.baseSchema = schema ? schema.merge(BaseSchema) : BaseSchema;

		// Validate environment
		this.validate();
	}

	private defaultErrorHandler = (error: ZodError): void => {
		const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");

		this.logger.error(`Environment validation error: ${errorMessages}`);
		this.debugLog("Full error", error.errors);

		throw error;
	};

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
			this.debugLog("Validation failed:", result.error);

			// Handle validation error
			if (typeof this.options.onValidationError === "function") {
				this.options.onValidationError(result.error);
				// Allow custom error handler to determine flow
				return {} as z.infer<typeof this.baseSchema>;
			}
			this.defaultErrorHandler(result.error);
			// Default error handler throws, so this won't be reached
			return {} as z.infer<typeof this.baseSchema>;
		}

		// Update environment with validated data
		this.validatedEnv = result.data;

		// Update process.env with validated values
		for (const [key, value] of Object.entries(this.validatedEnv)) {
			if (value !== undefined) {
				process.env[key] = String(value);
			}
		}

		this.debugLog("Validation successful:", this.validatedEnv);
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
	 * Dynamic .env file loading with proper precedence
	 */
	private loadEnvFiles(): void {
		const { envPath } = this.options;
		const currentMode = process.env.APP_MODE?.toLowerCase() || "development";
		const nodeEnv = process.env.NODE_ENV?.toLowerCase() || "development";

		// Define file loading order (later files take precedence)
		const envFiles = [
			".env", // Base defaults
			`.env.${nodeEnv}`, // Environment-specific (e.g. .env.test)
			`.env.${currentMode}`, // Mode-specific (e.g. .env.production)
			".env.local", // Local overrides
			`.env.${nodeEnv}.local`, // Environment-specific local overrides
			`.env.${currentMode}.local`, // Mode-specific local overrides
		];

		this.debugLog("Loading env files in order:", envFiles);

		// Load files in reverse order so later files take precedence
		for (const file of envFiles.reverse()) {
			const filePath = path.resolve(path.dirname(envPath), file);

			if (fs.existsSync(filePath)) {
				this.debugLog(`Loading env file: ${filePath}`);
				const result = dotenv.config({ path: filePath, override: true });
				if (result.error) {
					this.logger.warn(`Error loading ${file}:`, result.error);
				} else {
					this.debugLog(`Loaded env file: ${file}`);
				}
			} else {
				this.debugLog(`Env file not found: ${file}`);
			}
		}

		// Log final environment state after loading all files
		this.debugLog("Environment after loading files:", {
			NODE_ENV: process.env.NODE_ENV,
			APP_MODE: process.env.APP_MODE,
		});
	}

	/**
	 * Prepare environment variables with improved prefix handling
	 */
	private prepareEnvVars(): Record<string, string> {
		const { servicePrefix } = this.options;
		const envVars: Record<string, string> = {};

		this.debugLog("Initial process.env:", process.env);

		// First collect all environment variables
		for (const [key, value] of Object.entries(process.env)) {
			if (!value) continue;

			const upperKey = key.toUpperCase();
			let finalKey = upperKey;
			let finalValue = value.trim();

			// Handle prefixed variables
			if (servicePrefix && upperKey.startsWith(servicePrefix.toUpperCase())) {
				finalKey = upperKey.slice(servicePrefix.toUpperCase().length);
				this.debugLog(`Processing prefixed var: ${key} -> ${finalKey}`);
			}

			// Special case handling
			if (finalKey === "NODE_ENV" || finalKey === "APP_MODE") {
				finalValue = finalValue.toLowerCase();
			} else if (finalKey === "APP_NAME") {
				finalValue = "OPSTD.io"; // Ensure consistent casing
			}

			// Store the value
			envVars[finalKey] = finalValue;
		}

		// Set defaults if not present
		if (!envVars.NODE_ENV) envVars.NODE_ENV = "development";
		if (!envVars.APP_MODE) envVars.APP_MODE = "development";
		if (!envVars.APP_NAME) envVars.APP_NAME = "OPSTD.io";

		this.debugLog("Final prepared env vars:", envVars);
		return envVars;
	}

	/**
	 * Normalize environment variable value with fallback and type safety
	 */
	private normalizeEnvValue(value: string | undefined, fallback: string): string {
		return (value ?? fallback).toLowerCase().trim();
	}

	/**
	 * Conditional debug logging
	 */
	private debugLog(message: string, ...args: unknown[]): void {
		if (this.options.debug) {
			this.logger.debug(`[EnvValidator Debug] ${message}`, ...args);
		}
	}

	/**
	 * Utility to get current mode
	 */
	getAppMode(): AppMode {
		return this.validatedEnv.APP_MODE;
	}

	/**
	 * Check specific mode
	 */
	isAppMode(mode: AppMode): boolean {
		return this.validatedEnv.APP_MODE === mode;
	}
}

export { EnvValidator, z, type NodeEnv, type AppMode };
