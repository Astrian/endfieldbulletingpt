import OpenAI from "openai"

type LlmAnalysisJson = {
	events: LlmAnalysisEvent[]
	maintance: LlmAnalysisEvent[]
	summary: string
}

type LlmAnalysisEvent = {
	name: string
	start_time: string
	end_time: string
	detail: string
}

export default async function (
	content: string,
	env: Pick<Env, "EF_MIMO_API_KEY">,
): Promise<{ events: GameEvent[]; maintance: GameEvent[]; summary: string }> {
	// Get now time
	const now = new Date()
	// Format time as “2023 年 1 月 1 日 04:00”
	const now_time =
		now.getFullYear() +
		" 年 " +
		(now.getMonth() + 1) +
		" 月 " +
		now.getDate() +
		" 日 " +
		now.getHours() +
		":" +
		now.getMinutes()
	// let now_time = "2023 年 04 月 22 日"

	// Set prompt
	const system = `以下是《明日方舟：终末地》的公告网页 HTML，请帮我从里面提取活动/维护计划的名称、起止时间和详细信息，并再用一段话总结公告内容。

一些注意事项：

- 公告中出现的所有时间以北京时间展示
- 有可能会有多个活动/维护计划在同一公告中
- 公告发布时间是 ${now_time}，请按照此时间进行活动/维护计划时间的计算
- 公告中有可能不包含活动/维护计划有效信息，如遇此情况，请返回空数组
- 活动/维护计划详情请你进行精炼与总结
- 如果活动与「危机合约」有关，请在活动名称中标注「危机合约」字样
- 忽略与站外平台有关的活动（例如微博、小红书、B 站激励计划等）
- 如果公告中只有一张图片，events 和 maintance 请返回空数组，summary 请返回空字符串
- 如果侦测到某个活动或维护详情不包含精确的开始时间和结束时间，忽略这一条目

严格输出 JSON，除 JSON 外不要输出任何解释文字、Markdown 代码块或注释。JSON 结构如下：

{
  "events": [
    {
      "name": "「相见欢」复刻活动",
      "start_time": "2026-01-26T16:00",
      "end_time": "2026-02-09T03:59",
      "detail": "活动详情..."
    }
  ],
  "maintance": [
    {
      "name": "闪断更新",
      "start_time": "2026-01-26T16:00",
      "end_time": "2026-01-26T16:10",
      "detail": "维护详情..."
    }
  ],
  "summary": "公告总结"
}

如果 events 或 maintance 为空，请输出空数组 []。如果没有总结，请输出空字符串 ""。

详情、总结中涉及数量的星号请转换为 × 符号。
	`
	const result: {
		events: GameEvent[]
		maintance: GameEvent[]
		summary: string
	} = {
		events: [],
		maintance: [],
		summary: "",
	}
	try {
		console.log("start generating")
		const openai = new OpenAI({
			baseURL: "https://api.xiaomimimo.com/v1",
			apiKey: env.EF_MIMO_API_KEY,
		})
		const msg = await openai.chat.completions.create({
			model: "mimo-v2.5",
			temperature: 0.3,
			messages: [
				{
					role: "system",
					content: system,
				},
				{
					role: "user",
					content: content,
				},
			],
		})
		console.log(msg.choices[0].message.content)

		console.log("===")

		const parseRes = parseLlmAnalysisJson(msg.choices[0].message.content || "")
		console.log(parseRes)

		for (const event of parseRes.events) {
			result.events.push(toGameEvent(event))
		}

		for (const event of parseRes.maintance) {
			result.maintance.push(toGameEvent(event))
		}

		result.summary = parseRes.summary
	} catch (error) {
		console.log("error")
		console.log(error)
	}
	return result
}

function parseLlmAnalysisJson(content: string): LlmAnalysisJson {
	const json = extractJson(content)
	const parsed = JSON.parse(json) as Partial<LlmAnalysisJson>

	return {
		events: normalizeEvents(parsed.events),
		maintance: normalizeEvents(parsed.maintance),
		summary: typeof parsed.summary === "string" ? parsed.summary : "",
	}
}

function extractJson(content: string): string {
	const trimmed = content.trim()
	const fencedMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
	if (fencedMatch) {
		return fencedMatch[1]
	}

	return trimmed
}

function normalizeEvents(events: unknown): LlmAnalysisEvent[] {
	if (!Array.isArray(events)) {
		return []
	}

	return events.filter(isLlmAnalysisEvent)
}

function isLlmAnalysisEvent(event: unknown): event is LlmAnalysisEvent {
	if (!event || typeof event !== "object") {
		return false
	}

	const candidate = event as Partial<Record<keyof LlmAnalysisEvent, unknown>>
	return (
		typeof candidate.name === "string" &&
		typeof candidate.start_time === "string" &&
		typeof candidate.end_time === "string" &&
		typeof candidate.detail === "string"
	)
}

function toGameEvent(event: LlmAnalysisEvent): GameEvent {
	const startTimeString = `${event.start_time}:00+08:00`
	const endTimeString = `${event.end_time}:00+08:00`

	console.log(`start_time_string: ${startTimeString}`)
	console.log(`end_time_string: ${endTimeString}`)

	return {
		name: event.name,
		start_time: new Date(startTimeString),
		end_time: new Date(endTimeString),
		detail: event.detail,
	}
}
