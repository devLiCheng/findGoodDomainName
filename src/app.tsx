import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { Layout } from './views/layout'
import { HomePage } from './views/home'
import { LoginPage } from './views/login'
import { FavoritesPage } from './views/favorites'
import { NewsListPage } from './views/news-list'
import { NewsDetailPage } from './views/news-detail'
import { getAuthUser, setAuthCookie, removeAuthCookie, createToken } from './middleware/auth'
import { users, favorites, news } from './services/db'
import domainRoutes from './routes/domain'
import authApiRoutes from './routes/auth'
import favoritesApiRoutes from './routes/favorites'
import newsApiRoutes from './routes/news'
import type { Lang } from './views/layout'

const app = new Hono()

// API routes
app.route('/api', domainRoutes)
app.route('/api/auth', authApiRoutes)
app.route('/api/favorites', favoritesApiRoutes)
app.route('/api/news', newsApiRoutes)

// Get language from query param or cookie
function getLang(c: any): Lang {
  const qLang = c.req.query('lang') as Lang | undefined
  if (qLang === 'zh' || qLang === 'en') return qLang
  const ckLang = getCookie(c, 'lang') as Lang | undefined
  if (ckLang === 'zh' || ckLang === 'en') return ckLang
  // Detect from Accept-Language header
  const al = c.req.header('Accept-Language') || ''
  if (al.startsWith('zh')) return 'zh'
  return 'zh'
}

// Home page (SSR)
app.get('/', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  let favoritedDomains: string[] = []
  if (user) {
    favoritedDomains = Array.from(favorites.getFavoritedDomains(user.id))
  }
  return c.html(
    <Layout user={user} lang={lang} currentUrl="/">
      <HomePage lang={lang} user={user} favoritedDomains={favoritedDomains} />
    </Layout>
  )
})

// Login page (SSR)
app.get('/login', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (user) return c.redirect('/')
  const error = c.req.query('error') || undefined
  const redirect = c.req.query('redirect') || '/'
  return c.html(
    <Layout lang={lang}>
      <LoginPage lang={lang} error={error} redirect={redirect} mode="login" />
    </Layout>
  )
})

// Login POST (form submit)
app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')
  const redirect = String(body.redirect || '/')

  if (!email || !password) {
    return c.redirect(`/login?error=${encodeURIComponent('请填写邮箱和密码')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const user = users.findByEmail(email)
  if (!user) {
    return c.redirect(`/login?error=${encodeURIComponent('邮箱或密码错误')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const valid = await Bun.password.verify(password, user.password_hash)
  if (!valid) {
    return c.redirect(`/login?error=${encodeURIComponent('邮箱或密码错误')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const token = await createToken({ id: user.id, email: user.email })
  setAuthCookie(c, token)
  return c.redirect(redirect)
})

// Register page (SSR)
app.get('/register', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (user) return c.redirect('/')
  const error = c.req.query('error') || undefined
  return c.html(
    <Layout lang={lang}>
      <LoginPage lang={lang} error={error} mode="register" />
    </Layout>
  )
})

// Register POST (form submit)
app.post('/register', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')

  if (!email || !password) {
    return c.redirect('/register?error=' + encodeURIComponent('请填写邮箱和密码'))
  }
  if (password.length < 6) {
    return c.redirect('/register?error=' + encodeURIComponent('密码至少6位'))
  }

  const existing = users.findByEmail(email)
  if (existing) {
    return c.redirect('/register?error=' + encodeURIComponent('该邮箱已注册'))
  }

  const passwordHash = await Bun.password.hash(password)
  users.create(email, passwordHash)

  const newUser = users.findByEmail(email)
  if (newUser) {
    const token = await createToken({ id: newUser.id, email: newUser.email })
    setAuthCookie(c, token)
  }

  return c.redirect('/')
})

// Logout
app.get('/logout', (c) => {
  removeAuthCookie(c)
  return c.redirect('/')
})

// Favorites page (SSR)
app.get('/favorites', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login?redirect=' + encodeURIComponent('/favorites'))

  const favs = favorites.listByUser(user.id)
  return c.html(
    <Layout user={user} lang={lang} currentUrl="/favorites">
      <FavoritesPage lang={lang} favorites={favs} />
    </Layout>
  )
})

// News list page (SSR for SEO)
app.get('/news', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const page = parseInt(c.req.query('page') || '1')
  const data = news.list(page, 10)

  return c.html(
    <Layout user={user} lang={lang} title="行业动态" currentUrl="/news">
      <NewsListPage
        lang={lang as 'zh' | 'en'}
        newsItems={data.items}
        page={data.page}
        total={data.total}
        limit={data.limit}
      />
    </Layout>
  )
})

// News detail page (SSR for SEO)
app.get('/news/:slug', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const slug = c.req.param('slug')
  const article = news.findBySlug(slug)

  if (!article) {
    return c.notFound()
  }

  return c.html(
    <Layout user={user} lang={lang} title={article.title} currentUrl={`/news/${slug}`}>
      <NewsDetailPage lang={lang as 'zh' | 'en'} news={article} />
    </Layout>
  )
})

export default app
