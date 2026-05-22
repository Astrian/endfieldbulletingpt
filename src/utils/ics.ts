function formatUtcIcsDate(date: Date): string {
	return date
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "Z")
}

function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
}

function foldIcsLine(line: string): string {
	const chunks: string[] = []
	let rest = line

	while (rest.length > 75) {
		chunks.push(rest.slice(0, 75))
		rest = ` ${rest.slice(75)}`
	}

	chunks.push(rest)
	return chunks.join("\r\n")
}

export async function getIcs(env: Pick<Env, "DB" | "EF_CONTACT">): Promise<string> {
	const { results } = await env.DB.prepare(
		'SELECT "id", "name", "start_time", "end_time", "detail" FROM "events" ORDER BY "start_time"',
	).all<StoredGameEvent>()

	const events = results
		.map((event) => {
			const startTime = formatUtcIcsDate(new Date(event.start_time))
			const endTime = formatUtcIcsDate(new Date(event.end_time))
			const description = `${event.detail}\n注：活动名称、时间与详情由 Xiaomi Mimo 模型生成，仅供参考。可以前往 ${env.EF_CONTACT} 进行勘误。`

			return [
				"BEGIN:VEVENT",
				`UID:${event.id}`,
				`DTSTAMP:${startTime}`,
				`DTSTART:${startTime}`,
				`DTEND:${endTime}`,
				`SUMMARY:${escapeIcsText(event.name)}`,
				`DESCRIPTION:${escapeIcsText(description)}`,
				"END:VEVENT",
			]
				.map(foldIcsLine)
				.join("\r\n")
		})
		.join("\r\n")

	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Astrian Zheng//EndfieldBulletinGPT v1.0//EN",
		"CALSCALE:GREGORIAN",
		"X-WR-CALNAME:明日方舟：终末地公告",
		events,
		"END:VCALENDAR",
		"",
	].join("\r\n")
}
