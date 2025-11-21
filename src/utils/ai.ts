import type { TGInboxSettings } from "../settings";
import type { MessageData } from "./template";
import * as Mustache from "mustache";

// Default prompt template (same as Python version, but with Mustache syntax)
const DEFAULT_AI_PROMPT = `根据以下Telegram消息内容,生成一个合适的邮件标题.

消息内容: {{{text}}}
发送人: {{name}} (@{{username}})

要求:
1. 标题前面要有1-3个方括号格式的标签(2-4个字左右)以表示消息的类别
格式:
#tag1 #tag2 #tag3 title
标签和标题之间用空格分隔. 标签可以是主题、情感、用途等方面的关键词,帮助快速识别消息内容.
示例:
#编程开发 #工具 #方法论 具体标题
#学习心得 #记忆力 #方法论 间隔重复与记忆巩固的挑战
#幸福 #心理 #感悟 记录"小确幸"，降低抑郁倾向
2. 标题要简洁明了,能够概括消息的主要内容
3. 标题总长度不超过50个字符,不要有特殊字符
4. 如果消息内容为空或无意义，请生成 #待定 {{name}}

请直接返回标题,不要其他内容,不要用\`\`包裹。`;

/**
 * Generate AI-powered title with category tags (like Python version)
 * @param messageData The message data with all template variables
 * @param settings Plugin settings containing AI configuration
 * @returns AI-generated title or fallback title if AI fails
 */
export async function transformMessageWithAI(
	messageData: MessageData,
	settings: TGInboxSettings
): Promise<string> {
	if (!settings.ai_enabled) {
		return messageData.text;
	}

	if (!settings.openai_api_key) {
		console.warn("AI transformation enabled but API key not configured");
		return messageData.text;
	}

	// Trim whitespace from API key
	const apiKey = settings.openai_api_key.trim();
	const apiUrl = settings.openai_api_base_url.trim();

	// Use custom prompt or default prompt
	const promptTemplate = settings.ai_prompt?.trim() || DEFAULT_AI_PROMPT;

	// Render prompt with Mustache
	const prompt = Mustache.render(promptTemplate, messageData);

	try {
		const requestBody = {
			model: settings.ai_model,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: 100,
		};

		// Debug log
		console.log(`
=== AI API Debug ===
URL: ${apiUrl}
Model: ${settings.ai_model}
Prompt: ${prompt.substring(0, 100)}...
====================
`);

		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
				"HTTP-Referer": "https://obsidian.md",
				"X-Title": "Obsidian Telegram Inbox",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`AI API error: ${response.status} ${response.statusText}`, errorText);
			return `#异常 Telegram Message from ${messageData.name}`;
		}

		const result = await response.json();

		if (result.choices && result.choices.length > 0) {
			const aiResponse = result.choices[0].message.content.trim();
			console.log("AI transformed message:", aiResponse);
			return aiResponse;
		} else {
			console.warn("AI response has no choices");
			return `#未知 Telegram Message from ${messageData.name}`;
		}
	} catch (error) {
		console.error("Failed to transform message with AI:", error);
		return `#异常 Telegram Message from ${messageData.name}`;
	}
}
