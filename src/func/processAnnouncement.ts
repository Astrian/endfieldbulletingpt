import utils from "../utils/index.ts"
import checkBulletinExist from "./checkBulletinExist.ts"
import markBulletinExist from "./markBulletinExist.ts"
import updateEvents from "./updateEvents.ts"

export default async function (
	announcementItem: EndfieldBulletinListItem,
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

		const html = utils.unescapeHtml(content.data.data.html)
		const telegraphTitle = content.data.header || stripLineBreaks(content.data.title)
		const pushUrl = await utils.telegraphPost(html, telegraphTitle, env)
		await utils.sendTelegramMessage(
			env,
			`<b>新游戏内公告</b>：${pushUrl}\n省流：${res.summary}\n${announcementTabTag(content.data.tab)}`,
		)
	} else {
		await utils.sendTelegramPhoto(
			env,
			content.data.data.url,
			`<b>新游戏内公告</b>：<a href="${content.data.data.link}">${stripLineBreaks(content.data.title)}</a>\n${announcementTabTag(content.data.tab)}`,
		)
	}
}

function announcementTabTag(tab: EndfieldBulletinContentData["tab"]): string {
	switch (tab) {
		case "updates":
			return "#更新公告"
		case "events":
			return "#活动通知"
		case "news":
			return "#资讯速报"
	}
}

function stripLineBreaks(value: string): string {
	return value.replace(/\\[rn]|[\r\n]/g, "")
}
