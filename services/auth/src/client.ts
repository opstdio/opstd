import { createAuthClient } from "better-auth/react";
import {
	adminClient,
	anonymousClient,
	apiKeyClient,
	jwtClient,
	multiSessionClient,
	organizationClient,
	twoFactorClient,
	passkeyClient,
} from "better-auth/client/plugins";
import { z, EnvValidator } from "@opstd/env-validator";

import { createLogger } from "@opstd/logger";
import process from "node:process";

const betterAuthSchema = z.object({
	ALLOWED_ORIGINS: z.string().optional(),
	BETTER_AUTH_URL: z.string().url().optional(),
});

const envValidator = new EnvValidator(betterAuthSchema);
envValidator.validate();

const customLogger = createLogger({
	serviceName: "auth-client",
	environment: process.env.NODE_ENV || "development",
	logLevel: "info",
});

export const client = createAuthClient({
	plugins: [
		anonymousClient(),
		organizationClient({
			teams: {
				enabled: true,
			},
		}),
		twoFactorClient(),
		passkeyClient(),
		adminClient(),
		multiSessionClient(),
		apiKeyClient(),
		jwtClient(),
	],
	fetchOptions: {
		onError(e) {
			customLogger.error("error", e.error);
		},
	},
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	organization,
	useListOrganizations,
	useActiveOrganization,
} = client;

client.$store.listen("$sessionSignal", async () => {});
