import type { NextConfig } from "next";
import { EnvValidator, z } from "@opstd/env-validator";
const envValidator = new EnvValidator(z.object({}), {
	debug: true,
	appMode: "development",
});

envValidator.validate();
const nextConfig: NextConfig = {
	/* config options here */
};

export default nextConfig;
