declare global {
	interface Env {
		EF_MIMO_API_KEY: string
		DB: D1Database
	}

	var process: {
		env: Partial<Record<string, string>>
	}

	interface EndfieldBulletinResponse {
		code: 0
		msg: string
		data: {
			topicCid: string
			type: 0
			platform: "iOS"
			server: "#DEFAULT"
			channel: "1"
			subChannel: "#DEFAULT"
			lang: "zh-cn"
			key: "0:iOS:#DEFAULT:1:#DEFAULT:zh-cn"
			version: string
			popupVersion: 0
			updatedAt: number
			onlineList: {
				cid: string
				version: number
				needRedDot: boolean
				needPopup: boolean
			}[]
			list: EndfieldBulletinListItem[]
		}
	}

	interface EndfieldBulletinListItem {
		cid: string
		type: 0
		tab: "updates" | "events" | "news"
		orderType: 0 | 1 | 2
		orderWeight: number
		displayType: "rich_text" | "picture"
		startAt: number
		focus: 0 | 1
		title: string
	}

	interface EndfieldBulletinContent {
		code: 0
		data: EndfieldBulletinContentData
		msg: string
	}

	type EndfieldBulletinContentData =
		| EndfieldBulletinRichTextContentData
		| EndfieldBulletinPictureContentData

	interface EndfieldBulletinBaseContentData {
		cid: string
		type: 0
		tab: "updates" | "events" | "news"
		orderType: 0 | 1 | 2
		orderWeight: number
		focus: 0 | 1
		startAt: number
		title: string
		header: string
		jumpButton: unknown
		needRedDot: boolean
		needPopup: boolean
		version: number
	}

	interface EndfieldBulletinRichTextContentData extends EndfieldBulletinBaseContentData {
		displayType: "rich_text"
		data: {
			html: string
			linkType: 1
		}
	}

	interface EndfieldBulletinPictureContentData extends EndfieldBulletinBaseContentData {
		displayType: "picture"
		data: {
			url: string
			link: string
			linkType: 1
		}
	}

	type GameEvent = {
		name: string
		start_time?: Date
		end_time?: Date
		detail: string
	}
}

export {}
