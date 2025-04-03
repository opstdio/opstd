import { z } from "zod";

export type NodeEnv = "development" | "production" | "test";
export type AppMode = "development" | "production" | "test" | "staging";

export const BaseSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development")
		.transform((env) => env as NodeEnv),
	APP_MODE: z
		.enum(["development", "production", "test", "staging"])
		.default("development")
		.transform((env) => env as AppMode),
	APP_NAME: z.string().default("OPSTD.io"),
});
