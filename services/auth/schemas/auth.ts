import {
	pgSchema,
	uuid,
	text,
	timestamp,
	boolean,
	integer,
	index,
	unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
};
export const authSchema = pgSchema("auth");

export const users = authSchema.table(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("email_verified").notNull(),
		image: text("image"),
		isAnonymous: boolean("is_anonymous"),
		role: text("role"),
		banned: boolean("banned"),
		banReason: text("ban_reason"),
		banExpires: timestamp("ban_expires"),
		twoFactorEnabled: boolean("two_factor_enabled"),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.isAnonymous),
		index().on(table.role),
		index().on(table.emailVerified),
		index().on(table.banned),
		index().on(table.banExpires),
		index().on(table.email),
		index().on(table.twoFactorEnabled),
	],
);

export const twoFactors = authSchema.table(
	"two_factors",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [index().on(table.userId)],
);

export const sessions = authSchema.table(
	"sessions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		impersonatedBy: uuid("impersonated_by"),
		activeOrganizationId: uuid("active_organization_id"),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.expiresAt),
		index().on(table.userId),
		index().on(table.token),
	],
);

export const accounts = authSchema.table(
	"accounts",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.accessTokenExpiresAt),
		index().on(table.refreshTokenExpiresAt),
		unique().on(table.providerId, table.accountId),
		index().on(table.userId),
	],
);

export const verifications = authSchema.table(
	"verifications",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.expiresAt),
		index().on(table.identifier),
	],
);

export const apikeys = authSchema.table(
	"apikeys",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		name: text("name"),
		start: text("start"),
		prefix: text("prefix"),
		key: text("key").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		refillInterval: integer("refill_interval"),
		refillAmount: integer("refill_amount"),
		lastRefillAt: timestamp("last_refill_at"),
		enabled: boolean("enabled"),
		rateLimitEnabled: boolean("rate_limit_enabled"),
		rateLimitTimeWindow: integer("rate_limit_time_window"),
		rateLimitMax: integer("rate_limit_max"),
		requestCount: integer("request_count"),
		remaining: integer("remaining"),
		lastRequest: timestamp("last_request"),
		expiresAt: timestamp("expires_at"),
		permissions: text("permissions"),
		metadata: text("metadata"),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.enabled),
		index().on(table.expiresAt),
	],
);

export const organizations = authSchema.table(
	"organizations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		name: text("name").notNull(),
		slug: text("slug").unique(),
		logo: text("logo"),
		metadata: text("metadata"),
	},
	(table) => [index().on(table.createdAt), index().on(table.updatedAt), index().on(table.slug)],
);

export const teams = authSchema.table(
	"teams",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		name: text("name").notNull(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.organizationId),
	],
);

export const members = authSchema.table(
	"members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
		role: text("role").notNull(),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.role),
		index().on(table.teamId),
	],
);

export const invitations = authSchema.table(
	"invitations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
		email: text("email").notNull(),
		role: text("role"),
		status: text("status").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		inviterId: uuid("inviter_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		index().on(table.createdAt),
		index().on(table.updatedAt),
		index().on(table.expiresAt),
	],
);

export const jwkss = authSchema.table(
	"jwkss",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		publicKey: text("public_key").notNull(),
		privateKey: text("private_key").notNull(),
	},
	(table) => [index().on(table.createdAt), index().on(table.updatedAt)],
);

export const passkeys = authSchema.table(
	"passkeys",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		...timestamps,
		name: text("name"),
		publicKey: text("public_key").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		credentialID: text("credential_id").notNull(),
		counter: integer("counter").notNull(),
		deviceType: text("device_type").notNull(),
		backedUp: boolean("backed_up").notNull(),
		transports: text("transports"),
	},
	(table) => [index().on(table.createdAt), index().on(table.updatedAt), index().on(table.userId)],
);
