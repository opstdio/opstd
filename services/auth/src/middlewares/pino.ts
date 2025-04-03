import type { MiddlewareHandler, Context, Next } from "hono";
import type { Logger } from "@opstd/logger";
import { createLogger } from "@opstd/logger";

import { getPath } from "hono/utils/url";
import process from "node:process";

export const pinoLogger = (
	logger: Logger = createLogger({
		serviceName: "auth-service",
		environment: process.env.NODE_ENV || "development",
		logLevel: "info",
	}),
): MiddlewareHandler => {
	return async (c: Context, next: Next) => {
		const { method } = c.req;
		const requestId = c.get("requestId") ?? undefined;
		const path = getPath(c.req.raw);
		logger.info(
			{
				requestId: requestId,
				request: {
					method,
					path,
				},
			},
			"Incoming request",
		);

		const start = Date.now();

		await next();

		const { status } = c.res;

		const logLevel = selectLogLevel(status);

		logger[logLevel](
			{
				requestId: requestId,
				response: {
					status,
					ok: String(c.res.ok),
					time: time(start),
				},
			},
			"Request completed",
		);
	};
};

function selectLogLevel(status: number): "info" | "warn" | "error" {
	if (status >= 200 && status < 300) {
		return "info"; // Successo
	}
	if (status >= 400 && status < 500) {
		return "warn"; // Errori client (400-499)
	}
	if (status >= 500) {
		return "error"; // Errori server (500-599)
	}
	return "info"; // Default
}

function humanize(times: string[]): string {
	const [delimiter, separator] = [",", "."];
	const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${delimiter}`));

	return orderTimes.join(separator);
}

function time(start: number): string {
	const delta = Date.now() - start;

	return humanize([delta < 1000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`]);
}
