import pino from "pino";

export interface CustomLoggerConfig {
	serviceName: string;
	environment: string;
	logLevel?: string;
}

export const createLoggerConfig = (config: CustomLoggerConfig): pino.LoggerOptions => ({
	level: config.logLevel || "info",
	timestamp: pino.stdTimeFunctions.isoTime,
	formatters: {
		level: (label) => {
			return {
				level: label.toUpperCase(),
				service: config.serviceName,
				environment: config.environment,
			};
		},
	},
});
