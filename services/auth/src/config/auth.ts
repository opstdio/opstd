import { z } from "zod";
import process from "node:process";

export const AuthConfigSchema = z.object({
	providers: z.object({
		emailPassword: z.boolean().default(true),
		apiKey: z
			.object({
				enabled: z.boolean().default(true),
				enableMetadata: z.boolean().default(true),
			})
			.optional(),
		passkey: z.boolean().default(true),
		twoFactor: z.boolean().default(true),
		multiSession: z.boolean().default(true),
		jwt: z.boolean().default(true),
		admin: z.boolean().default(false),
		organization: z
			.object({
				enabled: z.boolean().default(false),
				teams: z.boolean().default(false),
			})
			.optional(),
	}),
	security: z.object({
		crossSubDomainCookies: z.boolean().default(false),
		sameSite: z.enum(["strict", "lax", "none"]).default("lax"),
		secureInProduction: z.boolean().default(true),
	}),
	urls: z.object({
		allowedOrigins: z.array(z.string()).default(["http://localhost:3000", "http://localhost:4000"]),
		baseUrl: z.string().url().optional(),
		apiUrl: z.string().url().optional(),
	}),
	applicationAccess: z
		.object({
			strictMode: z.boolean().default(true),
			defaultAccess: z.boolean().default(false),
		})
		.optional(),
	advanced: z
		.object({
			generateId: z.boolean().default(false),
			defaultCookieAttributes: z
				.object({
					sameSite: z.enum(["strict", "lax", "none"]).default("lax"),
					secure: z.boolean().default(process.env.NODE_ENV === "production"),
				})
				.optional(),
		})
		.optional(),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export function createAuthConfig(config: Partial<AuthConfig> = {}): AuthConfig {
	return AuthConfigSchema.parse({
		...config,
		providers: {
			...config.providers,
		},
		security: {
			...config.security,
		},
		urls: {
			...config.urls,
			allowedOrigins: config.urls?.allowedOrigins ?? [
				"http://localhost:3000",
				"http://localhost:4000",
			],
		},
		advanced: {
			generateId: false,
			defaultCookieAttributes: {
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
			},
		},
	});
}
