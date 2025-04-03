import pino from "pino";
import type { CustomLoggerConfig } from "./config";

export const createTransports = (config: CustomLoggerConfig) => {
	return pino.transport({
		targets: [
			{
				target: "pino-logfmt",
				options: {
					flattenNestedObjects: true,
					convertToSnakeCase: true,
				},
			},
		],
	});
};
