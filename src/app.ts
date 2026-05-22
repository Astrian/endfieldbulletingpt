import { refresh } from "./refresh.ts"

export default {
	scheduled(_event, env, ctx) {
		ctx.waitUntil(refresh(env))
	},
} satisfies ExportedHandler<Env>
