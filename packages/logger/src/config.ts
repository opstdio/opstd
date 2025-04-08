import pino from "pino";
import { z } from "zod";

// Enhanced configuration schema with validation
export const LoggerConfigSchema = z.object({
	serviceName: z.string().min(1, "Service name is required"),
	environment: z.enum(["development", "production", "test"], {
		errorMap: () => ({ message: "Environment must be development, production, or test" }),
	}),
	logLevel: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
	prettyPrint: z.boolean().default(false),
	enableSourceLocation: z.boolean().default(false),
});

export type CustomLoggerConfig = z.infer<typeof LoggerConfigSchema>;

export const createLoggerConfig = (config: CustomLoggerConfig): pino.LoggerOptions => {
	// Validate configuration
	const validatedConfig = LoggerConfigSchema.parse(config);

	return {
		level: validatedConfig.logLevel,
		timestamp: pino.stdTimeFunctions.isoTime,
		formatters: {
			level: (label) => ({
				level: label.toUpperCase(),
				service: validatedConfig.serviceName,
				environment: validatedConfig.environment,
				...(validatedConfig.enableSourceLocation ? { source: true } : {}),
			}),
		},
		// Add pretty print for development environments
		...(validatedConfig.prettyPrint && validatedConfig.environment === "development"
			? { transport: { target: "pino-pretty" } }
			: {}),
	};
};

// Default configuration for easy logger creation
export const defaultLoggerConfig: CustomLoggerConfig = {
	serviceName: "unnamed-service",
	environment: "development",
	logLevel: "info",
	prettyPrint: true,
	enableSourceLocation: false,
};
