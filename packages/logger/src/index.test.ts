import { createLogger } from "./index";
import { describe, it, expect, vi } from "vitest";
import type { CustomLoggerConfig } from "./index";
import { defaultLoggerConfig } from "./config";

// Utility function to safely parse log entry
function parseLogEntry(logOutput: unknown): Record<string, any> {
	if (typeof logOutput === "string") {
		try {
			return JSON.parse(logOutput);
		} catch {
			return {};
		}
	}
	return {};
}

describe("Logger Creation", () => {
	it("should create a logger with default configuration", () => {
		const logger = createLogger({
			serviceName: "test-service",
			environment: "development",
		});

		expect(logger).toBeDefined();
		expect(logger.info).toBeDefined();
		expect(logger.error).toBeDefined();
		expect(logger.level).toBe("info");
	});

	it("should support custom log level", () => {
		const logger = createLogger({
			serviceName: "test-service",
			environment: "production",
			logLevel: "error",
		});

		expect(logger.level).toBe("error");
	});

	it("should handle transport options", () => {
		const logger = createLogger(
			{
				serviceName: "test-service",
				environment: "development",
			},
			{
				logfmt: false,
				console: true,
			},
		);

		expect(logger).toBeDefined();
	});

	it("should include service metadata in log formatters", () => {
		const logger = createLogger({
			serviceName: "metadata-test",
			environment: "development",
		});

		// Mock console to capture log output
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		try {
			const logOutput = logger.error("Test error");
			const logEntry = parseLogEntry(logOutput);

			expect(logEntry.level).toBe("ERROR");
			expect(logEntry.service).toBe("metadata-test");
			expect(logEntry.environment).toBe("development");
		} finally {
			consoleSpy.mockRestore();
		}
	});

	it("should fall back to default logger on partial configuration error", () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		try {
			const invalidConfig: Partial<CustomLoggerConfig> = {
				serviceName: "", // Empty service name
				environment: "development",
			};

			const logger = createLogger(invalidConfig);

			// Verify fallback logger properties
			expect(logger).toBeDefined();
			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(logger.level).toBe("info");

			// Verify default values are used
			const logOutput = logger.info("Test log");
			const logEntry = parseLogEntry(logOutput);
			expect(logEntry.service).toBe(defaultLoggerConfig.serviceName);
			expect(logEntry.environment).toBe(defaultLoggerConfig.environment);
		} finally {
			consoleErrorSpy.mockRestore();
		}
	});

	it("should handle completely invalid configuration gracefully", () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		try {
			// Use type assertion to bypass type checking
			const logger = createLogger({
				serviceName: 123 as any,
				environment: "development" as CustomLoggerConfig["environment"],
			});

			// Verify fallback logger properties
			expect(logger).toBeDefined();
			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(logger.level).toBe("info");

			// Verify default values are used
			const logOutput = logger.info("Test log");
			const logEntry = parseLogEntry(logOutput);
			expect(logEntry.service).toBe(defaultLoggerConfig.serviceName);
			expect(logEntry.environment).toBe(defaultLoggerConfig.environment);
		} finally {
			consoleErrorSpy.mockRestore();
		}
	});

	it("should use default configuration when no config is provided", () => {
		const logger = createLogger();

		expect(logger).toBeDefined();
		expect(logger.level).toBe("info");

		const logOutput = logger.info("Test log");
		const logEntry = parseLogEntry(logOutput);
		expect(logEntry.service).toBe(defaultLoggerConfig.serviceName);
		expect(logEntry.environment).toBe(defaultLoggerConfig.environment);
	});
});
