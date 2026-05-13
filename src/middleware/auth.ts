import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { users } from '../services/db'

const JWT_SECRET = process.env.JWT_SECRET || 'findgooddomain-secret-change-in-production'
const COOKIE_NAME = 'fgdn_token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

export interface AuthUser {
  id: number
  email: string
  nickname: string
  avatar: string
}

export async function getAuthUser(c: Context): Promise<AuthUser | null> {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return null
  try {
    const payload = await verify(token, JWT_SECRET) as { id: number; email: string; exp: number }
    if (payload.id && payload.email) {
      const profile = users.findById(payload.id)
      return {
        id: payload.id,
        email: payload.email,
        nickname: profile?.nickname || '',
        avatar: profile?.avatar || '',
      }
    }
    return null
  } catch {
    return null
  }
}

export async function createToken(user: AuthUser): Promise<string> {
  return await sign(
    { id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE },
    JWT_SECRET
  )
}

export function setAuthCookie(c: Context, token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Set true in production with HTTPS
    sameSite: 'Lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function removeAuthCookie(c: Context) {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
}

export async function getAuthUser(c: Context): Promise<AuthUser | null> {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return null
  try {
    const payload = await verify(token, JWT_SECRET) as { id: number; email: string; exp: number }
    if (payload.id && payload.email) {
      return { id: payload.id, email: payload.email }
    }
    return null
  } catch {
    return null
  }
}

// Middleware: require authentication
export async function requireAuth(c: Context, next: Next) {
  const user = await getAuthUser(c)
  if (!user) {
    // For API routes, return 401
    if (c.req.path.startsWith('/api/')) {
      return c.json({ error: '请先登录' }, 401)
    }
    // For page routes, redirect to login
    const redirectUrl = encodeURIComponent(c.req.url)
    return c.redirect(`/login?redirect=${redirectUrl}`)
  }
  c.set('user', user)
  await next()
}

// Middleware: attach user to context if logged in (optional)
export async function attachUser(c: Context, next: Next) {
  const user = await getAuthUser(c)
  if (user) {
    c.set('user', user)
  }
  await next()
}
