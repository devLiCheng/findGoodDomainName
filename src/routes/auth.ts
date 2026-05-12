import { Hono } from 'hono'
import { users } from '../services/db'
import { createToken, setAuthCookie, removeAuthCookie, getAuthUser } from '../middleware/auth'

const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>()
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    if (password.length < 6) {
      return c.json({ error: '密码至少6位' }, 400)
    }

    const existing = users.findByEmail(email.toLowerCase().trim())
    if (existing) {
      return c.json({ error: '该邮箱已注册' }, 409)
    }

    const passwordHash = await Bun.password.hash(password)
    users.create(email.toLowerCase().trim(), passwordHash)

    const newUser = users.findByEmail(email.toLowerCase().trim())
    if (!newUser) {
      return c.json({ error: '注册失败' }, 500)
    }

    const token = await createToken({ id: newUser.id, email: newUser.email })
    setAuthCookie(c, token)

    return c.json({ ok: true, user: { id: newUser.id, email: newUser.email } })
  } catch (err) {
    console.error('Register error:', err)
    return c.json({ error: '注册失败' }, 500)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>()
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const user = users.findByEmail(email.toLowerCase().trim())
    if (!user) {
      return c.json({ error: '邮箱或密码错误' }, 401)
    }

    const valid = await Bun.password.verify(password, user.password_hash)
    if (!valid) {
      return c.json({ error: '邮箱或密码错误' }, 401)
    }

    const token = await createToken({ id: user.id, email: user.email })
    setAuthCookie(c, token)

    return c.json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ error: '登录失败' }, 500)
  }
})

authRoutes.post('/logout', async (c) => {
  removeAuthCookie(c)
  return c.json({ ok: true })
})

authRoutes.get('/me', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ user: null })
  return c.json({ user: { id: user.id, email: user.email } })
})

export default authRoutes
