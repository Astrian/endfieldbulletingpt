import { getIcs } from "./ics.ts"
import llmAnalysis from "./llmAnalysis.ts"
import { sendTelegramMessage, sendTelegramPhoto } from "./telegram.ts"
import telegraphPost from "./telegraphPost.ts"
import unescapeHtml from "./unescapeHtml.ts"

export default {
	getIcs,
	llmAnalysis,
	sendTelegramMessage,
	sendTelegramPhoto,
	telegraphPost,
	unescapeHtml,
}
