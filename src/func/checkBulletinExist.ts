export default async function (db: D1Database, bulletinId: string): Promise<boolean> {
	const result = await db
		.prepare('SELECT "id" FROM "bulletins" WHERE "id" = ?')
		.bind(bulletinId)
		.first()

	return result !== null
}
