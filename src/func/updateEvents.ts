export default async function (db: D1Database, event: GameEvent): Promise<void> {
	if (!event.name || !event.start_time || !event.end_time || !event.detail) {
		return
	}

	await db
		.prepare(
			'INSERT INTO "events" ("id", "name", "start_time", "end_time", "detail") VALUES (?, ?, ?, ?, ?)',
		)
		.bind(
			crypto.randomUUID(),
			event.name,
			event.start_time.getTime(),
			event.end_time.getTime(),
			event.detail,
		)
		.run()
}
