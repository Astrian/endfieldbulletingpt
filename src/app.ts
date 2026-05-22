type Env = Record<string, never>

export default {
	async scheduled(_event, _env, _ctx) {
		refresh()
	},
} satisfies ExportedHandler<Env>

async function refresh() {}
