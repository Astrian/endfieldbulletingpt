export default function unescapeHtml(escaped: string): string {
	try {
		const jsonSafe = Array.from(
			escaped.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"),
		)
			.map((char) => {
				const code = char.charCodeAt(0)
				if (code < 0x20) {
					return `\\u${code.toString(16).padStart(4, "0")}`
				}

				return char
			})
			.join("")

		return JSON.parse(`"${jsonSafe}"`) as string
	} catch {
		return escaped
			.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
				String.fromCharCode(Number.parseInt(hex, 16)),
			)
			.replace(/\\"/g, '"')
			.replace(/\\\\/g, "\\")
			.replace(/\\\//g, "/")
	}
}
