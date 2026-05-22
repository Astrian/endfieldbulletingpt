type TelegramMessageOptions = Pick<Env, "EF_TELEGRAM_BOT_TOKEN" | "EF_TELEGRAM_CHAT_ID">

async function callTelegramApi(
	env: TelegramMessageOptions,
	method: "sendMessage" | "sendPhoto",
	payload: Record<string, unknown>,
): Promise<void> {
	const response = await fetch(
		`https://api.telegram.org/bot${env.EF_TELEGRAM_BOT_TOKEN}/${method}`,
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				chat_id: env.EF_TELEGRAM_CHAT_ID,
				...payload,
			}),
		},
	)

	if (!response.ok) {
		console.log(`Telegram ${method} failed: ${response.status} ${await response.text()}`)
	}
}

export async function sendTelegramMessage(
	env: TelegramMessageOptions,
	text: string,
): Promise<void> {
	await callTelegramApi(env, "sendMessage", {
		text,
		parse_mode: "HTML",
		disable_web_page_preview: false,
	})
}

export async function sendTelegramPhoto(
	env: TelegramMessageOptions,
	photo: string,
	caption: string,
): Promise<void> {
	await callTelegramApi(env, "sendPhoto", {
		photo,
		caption,
		parse_mode: "HTML",
	})
}
