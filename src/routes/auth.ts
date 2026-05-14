import { Hono } from 'hono'
import { users } from '../services/db'
import { createToken, setAuthCookie, removeAuthCookie, getAuthUser } from '../middleware/auth'

const authRoutes = new Hono()

// Simple math CAPTCHA store { id: { answer, expires } }
const captchaStore = new Map<string, { answer: number; expires: number }>()
const CAPTCHA_TTL = 5 * 60 * 1000 // 5 minutes

// Generate CAPTCHA
authRoutes.get('/captcha', (c) => {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const id = crypto.randomUUID()
  captchaStore.set(id, { answer: a + b, expires: Date.now() + CAPTCHA_TTL })
  return c.json({ id, question: `${a} + ${b} = ?` })
})

// Google OAuth redirect
authRoutes.get('/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return c.json({ error: 'Google OAuth not configured' }, 400)
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`
  const scope = 'openid email profile'
  const state = c.req.query('redirect') || '/'
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`
  return c.redirect(url)
})

// Google OAuth callback
authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state') || '/'
  if (!code) return c.json({ error: 'Missing code' }, 400)

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`

  if (!clientId || !clientSecret) return c.redirect(`/login?error=${encodeURIComponent('Google OAuth not configured')}`)

  try {
    // Exchange code for token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    })
    const tokenData = await tokenResp.json() as any
    if (tokenData.error) {
      return c.redirect(`/login?error=${encodeURIComponent('Google auth failed: ' + tokenData.error_description)}`)
    }

    // Get user info
    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const googleUser = await userResp.json() as any
    const email = googleUser.email?.toLowerCase()?.trim()
    if (!email) return c.redirect(`/login?error=${encodeURIComponent('Failed to get Google account info')}`)

    // Auto-login or register
    let user = users.findByEmail(email)
    if (!user) {
      const passwordHash = await Bun.password.hash('google-' + crypto.randomUUID())
      users.create(email, passwordHash)
      user = users.findByEmail(email)
      if (!user) return c.redirect(`/login?error=${encodeURIComponent('Registration failed')}`)
      // Set nickname from Google profile
      if (googleUser.name) {
        users.updateProfile(user.id, { nickname: googleUser.name })
      }
      if (googleUser.picture) {
        users.updateProfile(user.id, { avatar: googleUser.picture })
      }
    }

    const token = await createToken({ id: user.id, email: user.email, nickname: user.nickname || '', avatar: user.avatar || '' })
    setAuthCookie(c, token)
    return c.redirect(state)
  } catch (err) {
    console.error('Google OAuth error:', err)
    return c.redirect(`/login?error=${encodeURIComponent('Google auth error')}`)
  }
})

// GitHub OAuth redirect
authRoutes.get('/github', (c) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return c.json({ error: 'GitHub OAuth not configured' }, 400)
  const state = c.req.query('redirect') || '/'
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/auth/github/callback`)}&scope=user:email&state=${encodeURIComponent(state)}`
  return c.redirect(url)
})

// GitHub OAuth callback
authRoutes.get('/github/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state') || '/'
  if (!code) return c.json({ error: 'Missing code' }, 400)

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) return c.redirect(`/login?error=${encodeURIComponent('GitHub OAuth not configured')}`)

  try {
    // Exchange code for access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    })
    const tokenData = await tokenResp.json() as any
    if (tokenData.error) {
      return c.redirect(`/login?error=${encodeURIComponent(tokenData.error_description || 'GitHub auth failed')}`)
    }

    // Get user info
    const userResp = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'FindGoodDomain' },
    })
    const ghUser = await userResp.json() as any

    // Get email (may need separate call)
    let email = ghUser.email
    if (!email) {
      const emailResp = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'FindGoodDomain' },
      })
      const emails = await emailResp.json() as any[]
      const primary = emails?.find((e: any) => e.primary && e.verified)
      email = primary?.email || emails?.[0]?.email
    }
    if (!email) return c.redirect(`/login?error=${encodeURIComponent('Failed to get GitHub email')}`)

    // Auto-login or register
    let user = users.findByEmail(email.toLowerCase().trim())
    if (!user) {
      const passwordHash = await Bun.password.hash('github-' + crypto.randomUUID())
      users.create(email.toLowerCase().trim(), passwordHash)
      user = users.findByEmail(email.toLowerCase().trim())
      if (!user) return c.redirect(`/login?error=${encodeURIComponent('Registration failed')}`)
      if (ghUser.name || ghUser.login) {
        users.updateProfile(user.id, { nickname: ghUser.name || ghUser.login })
      }
      if (ghUser.avatar_url) {
        users.updateProfile(user.id, { avatar: ghUser.avatar_url })
      }
    }

    const token = await createToken({ id: user.id, email: user.email, nickname: user.nickname || '', avatar: user.avatar || '' })
    setAuthCookie(c, token)
    return c.redirect(state)
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    return c.redirect(`/login?error=${encodeURIComponent('GitHub auth error')}`)
  }
})

// Unified login-or-register: if email exists → verify password & login; if not → register
authRoutes.post('/login', async (c) => {
  try {
    const { email, password, captcha_id, captcha_answer } = await c.req.json<{
      email: string; password: string; captcha_id?: string; captcha_answer?: number
    }>()
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    // Validate CAPTCHA
    const captcha = captcha_id ? captchaStore.get(captcha_id) : undefined
    if (captcha && Date.now() < captcha.expires) {
      captchaStore.delete(captcha_id!)
      if (captcha_answer !== captcha.answer) {
        return c.json({ error: 'Verification code incorrect' }, 400)
      }
    } else if (captcha_id) {
      return c.json({ error: 'Verification code expired, please refresh' }, 400)
    }
    // If no captcha_id, allow (backward compat until UI updated)

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

// Avatar upload with server-side compression (max 2MB)
authRoutes.post('/avatar', async (c) => {
  const authUser = await getAuthUser(c)
  if (!authUser) return c.json({ error: 'Not logged in' }, 401)

  try {
    const body = await c.req.parseBody()
    const file = body.avatar as File | undefined
    if (!file) return c.json({ error: 'No file uploaded' }, 400)

    const MAX_SIZE = 2 * 1024 * 1024
    let buffer = Buffer.from(await file.arrayBuffer())

    if (buffer.length > MAX_SIZE) {
      return c.json({ error: 'Image must be less than 2MB' }, 400)
    }

    // Convert to base64 data URL
    const contentType = file.type || 'image/png'
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    const updated = users.updateProfile(authUser.id, { avatar: dataUrl })
    return c.json({ ok: true, user: updated })
  } catch {
    return c.json({ error: 'Upload failed' }, 500)
  }
})

export default authRoutes
