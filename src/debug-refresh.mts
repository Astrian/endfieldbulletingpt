async function main() {
	const apiKey = process.env.EF_MIMO_API_KEY

	if (!apiKey) {
		throw new Error("Missing EF_MIMO_API_KEY in .dev.vars")
	}

	throw new Error(
		"debug:refresh now requires the D1 DB binding. Use `pnpm dev` and trigger the scheduled Worker, or add a D1-backed debug runner.",
	)
}

await main()
