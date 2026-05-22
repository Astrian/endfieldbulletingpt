import { getPlatformProxy } from "wrangler"

import { refresh } from "./refresh.ts"

async function main() {
	const platform = await getPlatformProxy<Env>({
		envFiles: [".dev.vars"],
	})

	try {
		await refresh(platform.env)
	} finally {
		await platform.dispose()
	}
}

await main()
