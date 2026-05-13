import { Hono } from 'hono'
import { users } from '../services/db'
import { createToken, setAuthCookie, removeAuthCookie, getAuthUser } from '../middleware/auth'

const authRoutes = new Hono()

// Unified login-or-register: if email exists → verify password & login; if not → register
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>()
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    const normalizedEmail = email.toLowerCase().trim()
    let user = users.findByEmail(normalizedEmail)

    if (user) {
      // Existing user → login
      const valid = await Bun.password.verify(password, user.password_hash)
      if (!valid) {
        return c.json({ error: 'Invalid email or password' }, 401)
      }
    } else {
      // New user → register
      const passwordHash = await Bun.password.hash(password)
      users.create(normalizedEmail, passwordHash)
      user = users.findByEmail(normalizedEmail)
      if (!user) {
        return c.json({ error: 'Registration failed' }, 500)
      }
    }

    const token = await createToken({ id: user.id, email: user.email })
    setAuthCookie(c, token)

    return c.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname || '',
        avatar: user.avatar || '',
      },
    })
  } catch (err) {
    console.error('Auth error:', err)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

authRoutes.post('/logout', async (c) => {
  removeAuthCookie(c)
  return c.json({ ok: true })
})

authRoutes.get('/me', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ user: null })
  const profile = users.findById(user.id)
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: profile?.nickname || '',
      avatar: profile?.avatar || '',
    },
  })
})

authRoutes.post('/profile', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Not logged in' }, 401)
  try {
    const { nickname, avatar } = await c.req.json<{ nickname?: string; avatar?: string }>()
    const updated = users.updateProfile(authUser.id, { nickname, avatar })
    return c.json({ ok: true, user: updated })
  } catch {
    return c.json({ error: 'Update failed' }, 500)
  }
})

export default authRoutes
