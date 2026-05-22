import func from "./func/index.ts"

export async function refresh(
	env: Pick<
		Env,
		| "DB"
		| "EF_CONTACT"
		| "EF_MIMO_API_KEY"
		| "EF_TELEGRAM_BOT_TOKEN"
		| "EF_TELEGRAM_CHAT_ID"
		| "EF_TELEGRAPH_TOKEN"
	>,
) {
	console.log("debug")

	// 获取终末地公告 API 内容
	const response = await fetch(
		`https://game-hub.hypergryph.com/bulletin/v2/aggregate?lang=zh-cn&platform=iOS&server=1&channel=1&subChannel=1&type=0&code=endfield_5SD9TN&hideDetail=1`,
	)
	const announcements_list = (await response.json()) as EndfieldBulletinResponse

	// 遍历公告内容
	for (const announcement of announcements_list.data.list) {
		await func.processAnnouncement(announcement, env)
	}
}
