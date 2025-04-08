import pino from "pino";
import type { CustomLoggerConfig } from "./config";

export interface TransportOptions {
	logfmt?: boolean;
	console?: boolean;
	file?: {
		destination: string;
		maxSize?: string;
		maxFiles?: number;
	};
}

export const createTransports = (
	config: CustomLoggerConfig,
	transportOptions: TransportOptions = {},
) => {
	const transportTargets: Array<pino.TransportTargetOptions> = [];

	// Logfmt transport
	if (transportOptions.logfmt !== false) {
		transportTargets.push({
			target: "pino-logfmt",
			options: {
				flattenNestedObjects: true,
				convertToSnakeCase: true,
			},
		});
	}

	// Console transport (pretty print for development)
	if (transportOptions.console !== false) {
		transportTargets.push({
			target: config.environment === "development" ? "pino-pretty" : "pino/file",
			options: config.environment === "development" ? { colorize: true } : {},
		});
	}

	// File transport
	if (transportOptions.file) {
		transportTargets.push({
			target: "pino/file",
			options: {
				destination: transportOptions.file.destination,
				maxSize: transportOptions.file.maxSize || "10M",
				maxFiles: transportOptions.file.maxFiles || 5,
			},
		});
	}

	// If no targets, return undefined
	if (transportTargets.length === 0) {
		return undefined;
	}

	// Use pino.transport to create a destination stream
	return pino.transport({
		targets: transportTargets,
	});
};
