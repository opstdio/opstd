import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
	sources: [
		{
			name: "Auth",
			slug: "auth",
			url: "http://localhost/api/auth",
		},
		{
			name: "REST",
			slug: "rest",
			url: "http://localhost/api/rest",
		},
	],
};

export const GET = ApiReference(config);
