import func from "./func/index.ts"

export async function refresh(env: Pick<Env, "DB" | "EF_MIMO_API_KEY">) {
	console.log("debug")

	// 获取终末地公告 API 内容
	const response = await fetch(
		`https://game-hub.hypergryph.com/bulletin/v2/aggregate?lang=zh-cn&platform=iOS&server=1&channel=1&subChannel=1&type=0&code=endfield_5SD9TN&hideDetail=1`,
	)
	const announcements_list = (await response.json()) as EndfieldBulletinResponse

	// 遍历公告内容
	// announcements_list.data.list.forEach(async (announcement: EndfieldBulletinListItem) => {
	const announcement = announcements_list.data.list[0]
	await func.processAnnouncement(announcement, env)
	//})
}
