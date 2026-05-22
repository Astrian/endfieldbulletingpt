import utils from "../utils/index.ts"
import checkBulletinExist from "./checkBulletinExist.ts"
import markBulletinExist from "./markBulletinExist.ts"
import updateEvents from "./updateEvents.ts"

export default async function (
	announcementItem: EndfieldBulletinListItem,
	env: Pick<Env, "DB" | "EF_MIMO_API_KEY">,
) {
	console.log(announcementItem)

	const exists = await checkBulletinExist(env.DB, announcementItem.cid)
	if (exists) {
		return
	}

	await markBulletinExist(env.DB, announcementItem.cid)

	// 解析公告内容
	const announcement_content_request = await fetch(
		`https://game-hub.hypergryph.com/bulletin/detail/${announcementItem.cid}`,
	)
	const content = (await announcement_content_request.json()) as EndfieldBulletinContent
	console.log(content)

	if (content.data.displayType === "rich_text") {
		const res = await utils.llmAnalysis(content.data.data.html, env)
		console.log(res)

		for (const event of res.events) {
			await updateEvents(env.DB, event)
		}

		for (const event of res.maintance) {
			await updateEvents(env.DB, event)
		}
	}
}
