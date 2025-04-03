import { z } from "zod";

export const DatabaseSchema = z
	.object({
		DATABASE_URL: z.string().url().optional(),
		DB_HOST: z.string().default("localhost"),
		DB_PORT: z.coerce.number().default(5432),
		DB_USER: z.string().default("postgres"),
		POSTGRES_PASSWORD: z.string().default("<PASSWORD>"),
		DB_NAME: z.string().default("postgres"),
	})
	.transform((data) => {
		if (data.DATABASE_URL) {
			try {
				const parsedUrl = new URL(data.DATABASE_URL);

				return {
					DATABASE_URL: data.DATABASE_URL,
					DB_HOST: parsedUrl.hostname || "localhost",
					DB_PORT: parsedUrl.port ? Number.parseInt(parsedUrl.port) : 5432,
					DB_USER: parsedUrl.username || "postgres",
					POSTGRES_PASSWORD: parsedUrl.password || "<PASSWORD>",
					DB_NAME: parsedUrl.pathname.replace(/^\//, "") || "postgres",
				};
			} catch (error) {
				throw new Error("Invalid DATABASE_URL format");
			}
		}

		const generatedUrl = `postgres://${data.DB_USER}:${data.POSTGRES_PASSWORD}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}`;

		return {
			...data,
			DATABASE_URL: generatedUrl,
		};
	});
