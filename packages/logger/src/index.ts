import pino from "pino";
import { createLoggerConfig } from "./config";
import { createTransports } from "./transports";
import type { CustomLoggerConfig } from "./config";

export const createLogger = (config: CustomLoggerConfig) => {
	const loggerConfig = createLoggerConfig(config);
	const transports = createTransports(config);

	return pino(loggerConfig, transports);
};

export type { Logger } from "pino";
export type { CustomLoggerConfig };
