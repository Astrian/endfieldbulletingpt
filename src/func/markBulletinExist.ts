export default async function (db: D1Database, bulletinId: string): Promise<void> {
	await db.prepare('INSERT OR IGNORE INTO "bulletins" ("id") VALUES (?)').bind(bulletinId).run()
}
