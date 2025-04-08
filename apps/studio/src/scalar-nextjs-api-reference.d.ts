declare module "@scalar/nextjs-api-reference" {
	import type { HtmlRenderingConfiguration } from "@scalar/core/libs/html-rendering";

	export type ApiReferenceConfiguration = Partial<HtmlRenderingConfiguration>;

	export const ApiReference: (
		givenConfiguration: ApiReferenceConfiguration,
	) => () => Promise<Response>;
}
