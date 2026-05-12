import type { DeepSeekDomainItem, DeepSeekResponse } from '../types'

const API_KEY = process.env.DEEPSEEK_API_KEY || ''
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'

const SYSTEM_PROMPT = `你是一位资深的域名投资顾问和品牌命名专家。你的任务是：
1. 根据用户提供的关键字，生成极具商业潜力的域名建议
2. 每个域名必须简短、易记、有品牌感
3. 优先推荐 .com 域名，其次 .io、.ai、.app 等热门 TLD
4. 为每个域名提供简短有力的推荐理由（中文，1-2句话）
5. 域名应该是英文或拼音组合，不要使用中文域名

必须严格返回以下 JSON 数组格式，不要包含任何其他文字、markdown标记或解释：
[{"domain": "example.com", "reason": "推荐理由", "tld": ".com"}]`

function buildUserPrompt(keywords: string[], count: number): string {
  const keywordStr = keywords.join('、')
  return `用户的关键字是：${keywordStr}

请生成 ${count} 个与这些关键字关系密切的域名建议。要求：
- 域名要简短、有创意、有商业价值
- 结合关键字进行组合、变体、联想
- 考虑不同的 TLD（.com、.io、.ai、.app、.co 等）
- 每个推荐理由要说明该域名的商业潜力和品牌价值

直接返回JSON数组，不要包含任何markdown代码块标记。`
}

export async function generateDomainSuggestions(
  keywords: string[],
  count: number = 12
): Promise<DeepSeekDomainItem[]> {
  if (!API_KEY || API_KEY === 'your_deepseek_api_key_here') {
    throw new Error('请先配置 DEEPSEEK_API_KEY 环境变量')
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(keywords, count) },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errorText}`)
  }

  const data: DeepSeekResponse = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return parseDomainResponse(content)
}

function parseDomainResponse(content: string): DeepSeekDomainItem[] {
  let jsonStr = content.trim()

  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) {
      throw new Error('返回结果不是数组格式')
    }
    return parsed.map((item: Record<string, unknown>) => ({
      domain: String(item.domain || ''),
      reason: String(item.reason || ''),
      tld: String(item.tld || extractTld(String(item.domain || ''))),
    }))
  } catch (e) {
    console.error('JSON 解析失败，原始内容:', content)
    throw new Error(`DeepSeek 返回内容解析失败: ${(e as Error).message}`)
  }
}

function extractTld(domain: string): string {
  const match = domain.match(/\.([a-z]+)$/)
  return match ? `.${match[1]}` : '.com'
}
