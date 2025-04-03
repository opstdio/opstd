CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE TABLE "auth"."accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	CONSTRAINT "accounts_provider_id_account_id_unique" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."apikeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean,
	"rate_limit_enabled" boolean,
	"rate_limit_time_window" integer,
	"rate_limit_max" integer,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "auth"."invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" uuid,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."jwkss" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "auth"."passkeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"impersonated_by" uuid,
	"active_organization_id" uuid,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth"."teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"organization_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."two_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"is_anonymous" boolean,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"two_factor_enabled" boolean,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."apikeys" ADD CONSTRAINT "apikeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "auth"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."members" ADD CONSTRAINT "members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "auth"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_created_at_index" ON "auth"."accounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "accounts_updated_at_index" ON "auth"."accounts" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "accounts_access_token_expires_at_index" ON "auth"."accounts" USING btree ("access_token_expires_at");--> statement-breakpoint
CREATE INDEX "accounts_refresh_token_expires_at_index" ON "auth"."accounts" USING btree ("refresh_token_expires_at");--> statement-breakpoint
CREATE INDEX "accounts_user_id_index" ON "auth"."accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apikeys_created_at_index" ON "auth"."apikeys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "apikeys_updated_at_index" ON "auth"."apikeys" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "apikeys_enabled_index" ON "auth"."apikeys" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "apikeys_expires_at_index" ON "auth"."apikeys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitations_created_at_index" ON "auth"."invitations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invitations_updated_at_index" ON "auth"."invitations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "invitations_expires_at_index" ON "auth"."invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "jwkss_created_at_index" ON "auth"."jwkss" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jwkss_updated_at_index" ON "auth"."jwkss" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "members_created_at_index" ON "auth"."members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "members_updated_at_index" ON "auth"."members" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "members_role_index" ON "auth"."members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "members_team_id_index" ON "auth"."members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "organizations_created_at_index" ON "auth"."organizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organizations_updated_at_index" ON "auth"."organizations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "organizations_slug_index" ON "auth"."organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "passkeys_created_at_index" ON "auth"."passkeys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "passkeys_updated_at_index" ON "auth"."passkeys" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "passkeys_user_id_index" ON "auth"."passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_created_at_index" ON "auth"."sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_updated_at_index" ON "auth"."sessions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_index" ON "auth"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_index" ON "auth"."sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "teams_created_at_index" ON "auth"."teams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "teams_updated_at_index" ON "auth"."teams" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "teams_organization_id_index" ON "auth"."teams" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "two_factors_user_id_index" ON "auth"."two_factors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_created_at_index" ON "auth"."users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_updated_at_index" ON "auth"."users" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "users_is_anonymous_index" ON "auth"."users" USING btree ("is_anonymous");--> statement-breakpoint
CREATE INDEX "users_role_index" ON "auth"."users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_email_verified_index" ON "auth"."users" USING btree ("email_verified");--> statement-breakpoint
CREATE INDEX "users_banned_index" ON "auth"."users" USING btree ("banned");--> statement-breakpoint
CREATE INDEX "users_ban_expires_index" ON "auth"."users" USING btree ("ban_expires");--> statement-breakpoint
CREATE INDEX "users_email_index" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_two_factor_enabled_index" ON "auth"."users" USING btree ("two_factor_enabled");--> statement-breakpoint
CREATE INDEX "verifications_created_at_index" ON "auth"."verifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "verifications_updated_at_index" ON "auth"."verifications" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "verifications_expires_at_index" ON "auth"."verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verifications_identifier_index" ON "auth"."verifications" USING btree ("identifier");