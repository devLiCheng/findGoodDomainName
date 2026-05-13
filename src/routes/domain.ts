import { Hono } from 'hono'
import { generateDomainSuggestions } from '../services/deepseek'
import { checkDomain } from '../services/domain-checker'
import type { SuggestRequest, SuggestResponse, DomainSuggestion } from '../types'

const domainRoutes = new Hono()

domainRoutes.post('/suggest', async (c) => {
  try {
    const body = await c.req.json<SuggestRequest>()

    if (!body.keywords || !Array.isArray(body.keywords) || body.keywords.length === 0) {
      return c.json({ error: '请提供至少一个关键字' }, 400)
    }

    const keywords = body.keywords
      .filter((k: unknown) => typeof k === 'string')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0)

    if (keywords.length === 0) {
      return c.json({ error: '关键字不能为空' }, 400)
    }

    const count = body.count && body.count > 0 && body.count <= 20 ? body.count : 12

    const deepseekItems = await generateDomainSuggestions(keywords, count)

    const suggestions: DomainSuggestion[] = []
    const registered: DomainSuggestion[] = []

    // Check availability for each domain (with concurrency limit)
    const results = await Promise.all(
      deepseekItems.map(async (item) => {
        const available = await checkDomain(item.domain)
        return {
          domain: item.domain,
          available,
          reason: item.reason,
          tld: item.tld,
        }
      })
    )

    for (const result of results) {
      if (result.available) {
        suggestions.push(result)
      } else {
        registered.push(result)
      }
    }

    // Sort: available domains first (better for users)
    const response: SuggestResponse = { suggestions, registered, keywords }

    return c.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器内部错误'
    console.error('Domain suggest error:', message)
    return c.json({ error: message }, 500)
  }
})

domainRoutes.get('/check', async (c) => {
  const domain = c.req.query('domain') || ''
  if (!domain) return c.json({ error: 'Domain required' }, 400)
  const available = await checkDomain(domain.toLowerCase().trim())
  return c.json({ domain: domain.toLowerCase().trim(), available })
})

domainRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default domainRoutes
