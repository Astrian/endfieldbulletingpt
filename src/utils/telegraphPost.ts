import { type HTMLElement, type Node, NodeType, parse } from "node-html-parser"

const containerTags = new Set([
	"a",
	"aside",
	"b",
	"blockquote",
	"code",
	"em",
	"figcaption",
	"figure",
	"h3",
	"h4",
	"i",
	"li",
	"ol",
	"p",
	"pre",
	"s",
	"strong",
	"u",
	"ul",
])

const voidTags = new Set(["br", "hr", "img"])

function nodeToTelegraphNode(node: Node): TelegraphContent | null {
	if (node.nodeType === NodeType.TEXT_NODE) {
		const text = node.text.trim()
		return text || null
	}

	if (node.nodeType !== NodeType.ELEMENT_NODE) {
		return null
	}

	const element = node as HTMLElement
	const tagName = element.tagName.toLowerCase()

	if (!containerTags.has(tagName) && !voidTags.has(tagName)) {
		const children = element.childNodes
			.map(nodeToTelegraphNode)
			.filter((child): child is TelegraphContent => child !== null)

		if (children.length === 1) {
			return children[0]
		}

		if (children.length > 1) {
			return { tag: "p", children }
		}

		return null
	}

	const telegraphNode: TelegraphNode = { tag: tagName }
	const attrs: Record<string, string> = {}

	if (tagName === "a") {
		const href = element.getAttribute("href")
		if (href) {
			attrs.href = href
		}
	}

	if (tagName === "img") {
		const src = element.getAttribute("src")
		if (src) {
			attrs.src = src
		}
	}

	if (Object.keys(attrs).length > 0) {
		telegraphNode.attrs = attrs
	}

	if (!voidTags.has(tagName)) {
		const children = element.childNodes
			.map(nodeToTelegraphNode)
			.filter((child): child is TelegraphContent => child !== null)

		if (children.length > 0) {
			telegraphNode.children = children
		}
	}

	return telegraphNode
}

function imageToFigure(element: HTMLElement): TelegraphNode | null {
	const src = element.getAttribute("src")
	if (!src) {
		return null
	}

	return {
		tag: "figure",
		children: [{ tag: "img", attrs: { src } }],
	}
}

function parseHtmlToTelegraphNodes(html: string): TelegraphContent[] {
	const document = parse(html)
	const contentContainer =
		document.querySelector(".content") ?? document.querySelector(".cover") ?? document
	const nodes: TelegraphContent[] = []

	for (const child of contentContainer.childNodes) {
		if (child.nodeType === NodeType.ELEMENT_NODE) {
			const element = child as HTMLElement
			const tagName = element.tagName.toLowerCase()

			if (tagName === "div") {
				const img = element.querySelector("img")
				if (img) {
					const figure = imageToFigure(img)
					if (figure) {
						nodes.push(figure)
						continue
					}
				}
			}

			if (tagName === "img") {
				const figure = imageToFigure(element)
				if (figure) {
					nodes.push(figure)
					continue
				}
			}
		}

		const result = nodeToTelegraphNode(child)
		if (result === null) {
			continue
		}

		if (
			typeof result === "object" &&
			result.tag === "p" &&
			!result.children?.some((child) => (typeof child === "string" ? child.trim() : true))
		) {
			continue
		}

		nodes.push(result)
	}

	return nodes
}

export default async function telegraphPost(
	html: string,
	title: string,
	env: Pick<Env, "EF_TELEGRAPH_TOKEN">,
): Promise<string> {
	const content = parseHtmlToTelegraphNodes(html)
	if (content.length === 0) {
		return ""
	}

	const response = await fetch("https://api.telegra.ph/createPage", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			access_token: env.EF_TELEGRAPH_TOKEN,
			title,
			content: JSON.stringify(content),
		}),
	})

	const result = (await response.json()) as {
		ok: boolean
		result?: { url: string }
		error?: string
	}

	if (!result.ok) {
		console.log(`Telegraph API error: ${result.error ?? "unknown error"}`)
		return ""
	}

	return result.result?.url ?? ""
}
