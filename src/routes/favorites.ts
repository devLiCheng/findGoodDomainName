import { Hono } from 'hono'
import { favorites } from '../services/db'
import { getAuthUser } from '../middleware/auth'

const favoritesRoutes = new Hono()

favoritesRoutes.post('/add', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '请先登录' }, 401)

  try {
    const { domain, reason, tld } = await c.req.json<{ domain: string; reason: string; tld: string }>()
    if (!domain) return c.json({ error: '域名不能为空' }, 400)

    favorites.add(user.id, domain.toLowerCase(), reason || '', tld || '')
    return c.json({ ok: true })
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return c.json({ ok: true, message: '已经收藏过' })
    }
    return c.json({ error: '收藏失败' }, 500)
  }
})

favoritesRoutes.post('/remove', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '请先登录' }, 401)

  try {
    const { domain } = await c.req.json<{ domain: string }>()
    if (!domain) return c.json({ error: '域名不能为空' }, 400)

    favorites.remove(user.id, domain.toLowerCase())
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '取消收藏失败' }, 500)
  }
})

favoritesRoutes.get('/list', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: '请先登录' }, 401)

  const list = favorites.listByUser(user.id)
  return c.json({ favorites: list })
})

favoritesRoutes.get('/check/:domain', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ favorited: false })

  const domain = c.req.param('domain')
  const result = favorites.isFavorited(user.id, domain.toLowerCase())
  return c.json({ favorited: result })
})

export default favoritesRoutes
