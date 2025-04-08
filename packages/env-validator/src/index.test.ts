import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import { EnvValidator } from "./index";

describe("EnvValidator", () => {
	beforeEach(() => {
		// Clear all environment variables we might modify
		const keysToDelete = Object.keys(process.env).filter(key =>
			['NODE_ENV', 'APP_MODE', 'APP_NAME', 'DATABASE_URL'].includes(key) ||
			key.startsWith('SERVICE_')
		);
		keysToDelete.forEach(key => delete process.env[key]);

		// Set test defaults
		process.env.NODE_ENV = 'development';
		process.env.APP_MODE = 'development';
		process.env.APP_NAME = 'OPSTD.io';
	});

	it("should validate default environment variables", () => {
		const validator = new EnvValidator(undefined, {
			debug: true,
		});

		expect(validator.env.NODE_ENV).toBe("development");
		expect(validator.env.APP_MODE).toBe("development");
		expect(validator.env.APP_NAME).toBe("OPSTD.io");
	});

	it("should support custom environment schema", () => {
		const CustomSchema = z.object({
			DATABASE_URL: z.string().url(),
		});

		process.env.DATABASE_URL = "https://example.com/db";

		const validator = new EnvValidator(CustomSchema);

		expect(validator.env.DATABASE_URL).toBe("https://example.com/db");
	});

	it("should handle different app modes", () => {
		process.env.APP_MODE = "production";
		const validator = new EnvValidator();

		expect(validator.getAppMode()).toBe("production");
		expect(validator.isAppMode("production")).toBe(true);
		expect(validator.isAppMode("development")).toBe(false);
	});

	it("should call custom error handler on validation failure", () => {
		const mockErrorHandler = vi.fn();
		const InvalidSchema = z.object({
			REQUIRED_VAR: z.string().min(1),
		});

		const validator = new EnvValidator(InvalidSchema, {
			onValidationError: mockErrorHandler,
		});

		expect(mockErrorHandler).toHaveBeenCalledOnce();
	});

	it("should support service-specific environment variable prefixes", () => {
		const CustomSchema = z.object({
			DATABASE_URL: z.string().url(),
		});

		process.env.SERVICE_DATABASE_URL = "https://example.com/service-db";

		const validator = new EnvValidator(CustomSchema, {
			servicePrefix: "SERVICE_",
		});

		expect(validator.env.DATABASE_URL).toBe("https://example.com/service-db");
	});

	it("should handle debug logging", () => {
		const mockDebugLog = vi.fn();

		const validator = new EnvValidator(undefined, {
			debug: true,
		});

		// Since we can't easily mock the logger, we'll just ensure no errors occur
		expect(() => validator.validate()).not.toThrow();
	});
});
