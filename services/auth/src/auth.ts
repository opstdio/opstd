import { db } from "@opstd/db";
import * as schemas from "../schemas/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { z, EnvValidator } from "@opstd/env-validator";

const betterAuthSchema = z.object({
	ALLOWED_ORIGINS: z.string().optional(),
	BETTER_AUTH_URL: z.string().url().optional(),
	API_URL: z.string().url().optional(),
});

const envValidator = new EnvValidator(betterAuthSchema);
envValidator.validate();

interface AuthApiInterface {
	generateOpenAPISchema(): Promise<object>;
}

import {
	admin,
	anonymous,
	apiKey,
	bearer,
	jwt,
	multiSession,
	openAPI,
	organization,
	twoFactor,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import process from "node:process";
export const auth = betterAuth<BetterAuthOptions>({
	appName: envValidator.env.APP_NAME,
	baseURL: envValidator.env.API_URL ?? envValidator.env.BETTER_AUTH_URL,
	basePath: "/api/auth",
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: envValidator.env.ALLOWED_ORIGINS?.split(",") || [
		"http://localhost:3000",
		"http://localhost:4000",
		"http://localhost",
	],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schemas,
			user: schemas.users,
		},
		usePlural: true,
	}),
	plugins: [
		anonymous(),
		apiKey({
			enableMetadata: true,
		}),
		bearer(),
		multiSession(),
		openAPI({
			disableDefaultReference: true,
		}),
		jwt(),
		passkey(),
		twoFactor(),
		admin(),
		organization({
			teams: {
				enabled: true,
			},
		}),
	],
	advanced: {
		generateId: false,
		crossSubDomainCookies: {
			enabled: false,
		},
		defaultCookieAttributes: {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		},
	},
} as BetterAuthOptions) as ReturnType<typeof betterAuth> & {
	api: AuthApiInterface;
};
