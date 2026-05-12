import { Hono } from 'hono'
import { news } from '../services/db'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-change-me'

const newsRoutes = new Hono()

function checkAdmin(c: any): boolean {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  return token === ADMIN_TOKEN
}

newsRoutes.post('/create', async (c) => {
  if (!checkAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const { title, slug, content, summary } = await c.req.json<{
      title: string; slug: string; content: string; summary?: string
    }>()
    if (!title || !slug || !content) {
      return c.json({ error: 'title, slug, content are required' }, 400)
    }
    news.create(title, slug, content, summary || '')
    return c.json({ ok: true, slug })
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE')) {
      return c.json({ error: 'slug 已存在' }, 409)
    }
    return c.json({ error: '创建失败' }, 500)
  }
})

newsRoutes.post('/update', async (c) => {
  if (!checkAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const { id, title, content, summary } = await c.req.json<{
      id: number; title: string; content: string; summary?: string
    }>()
    if (!id || !title || !content) {
      return c.json({ error: 'id, title, content are required' }, 400)
    }
    news.update(id, title, content, summary || '')
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '更新失败' }, 500)
  }
})

newsRoutes.post('/delete', async (c) => {
  if (!checkAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const { id } = await c.req.json<{ id: number }>()
    if (!id) return c.json({ error: 'id is required' }, 400)
    news.delete(id)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '删除失败' }, 500)
  }
})

newsRoutes.get('/list', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const data = news.list(page, limit)
  return c.json(data)
})

export default newsRoutes
