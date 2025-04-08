import pino from "pino";
import {
	createLoggerConfig,
	CustomLoggerConfig,
	defaultLoggerConfig,
	LoggerConfigSchema,
} from "./config";
import { createTransports, TransportOptions } from "./transports";

// Extend Pino Logger type to ensure string return for log methods
export type Logger = pino.Logger & {
	info: (msg: string) => string;
	error: (msg: string) => string;
	warn: (msg: string) => string;
	debug: (msg: string) => string;
};

// Create a base log object with metadata
const createBaseLogObject = (config: CustomLoggerConfig, level: string, msg: string) => ({
	level: level.toUpperCase(),
	service: config.serviceName,
	environment: config.environment,
	msg,
	time: Date.now(),
});

export const createLogger = (
	config: Partial<CustomLoggerConfig> = {},
	transportOptions: TransportOptions = {},
): Logger => {
	try {
		// Merge with default configuration
		const mergedConfig: CustomLoggerConfig = {
			...defaultLoggerConfig,
			...config,
		};

		// Validate configuration
		const validatedConfig = LoggerConfigSchema.parse(mergedConfig);

		// Create logger configuration
		const loggerConfig = createLoggerConfig(validatedConfig);

		// Create transports
		const transports = createTransports(validatedConfig, transportOptions);

		// Create base logger
		const baseLogger = pino(loggerConfig, transports);

		// Create wrapped logger with custom methods
		return new Proxy(baseLogger, {
			get(target, prop) {
				if (prop === "info" || prop === "error" || prop === "warn" || prop === "debug") {
					return (msg: string) => {
						const logObject = createBaseLogObject(validatedConfig, prop as string, msg);
						(target as any)[prop](logObject);
						return JSON.stringify(logObject);
					};
				}
				return (target as any)[prop];
			},
		}) as Logger;
	} catch (error) {
		// Log configuration error
		console.error(
			"Logger configuration error:",
			error instanceof Error ? error.message : String(error),
		);

		// Create fallback logger
		const fallbackLogger = pino({
			level: "info",
			base: {
				service: defaultLoggerConfig.serviceName,
				environment: defaultLoggerConfig.environment,
			},
		});

		// Wrap fallback logger
		return new Proxy(fallbackLogger, {
			get(target, prop) {
				if (prop === "info" || prop === "error" || prop === "warn" || prop === "debug") {
					return (msg: string) => {
						const logObject = createBaseLogObject(defaultLoggerConfig, prop as string, msg);
						(target as any)[prop](logObject);
						return JSON.stringify(logObject);
					};
				}
				return (target as any)[prop];
			},
		}) as Logger;
	}
};

// Export types and configuration utilities
export type { CustomLoggerConfig };
export { defaultLoggerConfig, LoggerConfigSchema };
export { createLoggerConfig } from "./config";
export { createTransports } from "./transports";
