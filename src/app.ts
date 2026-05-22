import { refresh } from "./refresh.ts"
import utils from "./utils/index.ts"

export default {
	async fetch(request, env) {
		const url = new URL(request.url)

		if (url.pathname === "/") {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/endfield_events.ics",
				},
			})
		}

		if (url.pathname === "/endfield_events.ics") {
			const ics = await utils.getIcs(env)
			return new Response(ics, {
				headers: {
					"content-type": "text/calendar; charset=utf-8",
					"cache-control": "public, max-age=300",
				},
			})
		}

		return new Response("Not found", { status: 404 })
	},

	scheduled(_event, env, ctx) {
		ctx.waitUntil(refresh(env))
	},
} satisfies ExportedHandler<Env>
