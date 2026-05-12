const i18nData = {
  zh: {
    title: 'Find Good Domain Name',
    subtitle: 'AI 驱动域名生成器，找到你的下一个优质域名',
    placeholder: '输入关键字，用逗号或空格分隔...',
    generate: '生成',
    examples: '示例:',
    login: '登录',
    register: '注册',
    logout: '退出',
    favorites: '我的收藏',
    home: '首页',
    news: '行业动态',
    langLabel: 'EN',
    footer: '由 DeepSeek V4 Pro 驱动 · 基于 Bun + Hono 构建',
    password: '密码',
    noAccount: '还没有账号？',
    haveAccount: '已有账号？',
    loading: 'AI 正在生成域名建议...',
    errorPrefix: '错误',
    availableTitle: '未注册域名（高潜力）',
    registeredTitle: '已注册域名（参考）',
    availableBadge: '可注册',
    registeredBadge: '已注册',
    emptyResult: '没有返回域名建议，请尝试其他关键字。',
    favorite: '收藏',
    favorited: '已收藏',
    myFavorites: '我的收藏',
    noFavorites: '还没有收藏任何域名',
    newsTitle: '行业动态',
    noNews: '暂无新闻',
    prev: '上一页',
    next: '下一页',
  },
  en: {
    title: 'Find Good Domain Name',
    subtitle: 'AI-powered domain name generator, find your next great domain',
    placeholder: 'Enter keywords, separated by commas or spaces...',
    generate: 'Generate',
    examples: 'Examples:',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    favorites: 'Favorites',
    home: 'Home',
    news: 'News',
    langLabel: '中文',
    footer: 'Powered by DeepSeek V4 Pro · Built with Bun + Hono',
    password: 'Password',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    loading: 'AI is generating domain suggestions...',
    errorPrefix: 'Error',
    availableTitle: 'Unregistered Domains (High Potential)',
    registeredTitle: 'Already Registered Domains (Reference)',
    availableBadge: 'Available',
    registeredBadge: 'Registered',
    emptyResult: 'No domain suggestions returned. Try different keywords.',
    favorite: 'Save',
    favorited: 'Saved',
    myFavorites: 'My Favorites',
    noFavorites: 'No favorites yet',
    newsTitle: 'Industry News',
    noNews: 'No news yet',
    prev: 'Previous',
    next: 'Next',
  },
}

type Lang = 'zh' | 'en'

function t(lang: Lang, key: string): string {
  return i18nData[lang]?.[key as keyof typeof i18nData.zh] || i18nData.en[key as keyof typeof i18nData.en] || key
}

interface LayoutProps {
  children: any
  title?: string
  currentUrl?: string
  user?: { id: number; email: string } | null
  lang?: Lang
}

export function Layout({ children, title, currentUrl, user, lang = 'zh' }: LayoutProps) {
  const i18n = (key: string) => t(lang, key)
  const nextLang = lang === 'zh' ? 'en' : 'zh'

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - ${i18n('title')}` : i18n('title')}</title>
        <meta name="description" content="AI-powered domain name generator. Find the perfect domain name for your next project." />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); min-height: 100vh; color: #e0e0e0; }
          .container { max-width: 960px; margin: 0 auto; padding: 20px; }
          nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 30px; flex-wrap: wrap; gap: 10px; }
          nav a { color: #aaa; text-decoration: none; font-size: 0.9rem; padding: 6px 12px; border-radius: 8px; transition: all 0.2s; }
          nav a:hover { background: rgba(255,255,255,0.06); color: #fff; }
          .nav-left, .nav-right { display: flex; align-items: center; gap: 4px; }
          .nav-brand { color: #60a5fa; font-weight: 700; font-size: 1.1rem; margin-right: 16px; text-decoration: none; }
          .lang-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #aaa; padding: 4px 12px; border-radius: 16px; cursor: pointer; font-size: 0.75rem; text-decoration: none; transition: all 0.2s; }
          .lang-btn:hover { background: rgba(58,123,213,0.2); border-color: #3a7bd5; color: #fff; }
          .user-email { color: #888; font-size: 0.8rem; margin-right: 8px; }
          .main-content { min-height: 60vh; }
          footer { text-align: center; padding: 30px 20px; color: #555; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 40px; }
          .ad-placeholder { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; text-align: center; color: #555; font-size: 0.75rem; margin: 20px 0; }
          .search-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; margin-bottom: 24px; backdrop-filter: blur(10px); }
          .input-group { display: flex; gap: 10px; margin-bottom: 14px; }
          .input-group input { flex: 1; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; background: rgba(0,0,0,0.3); color: #fff; font-size: 0.95rem; outline: none; }
          .input-group input:focus { border-color: #3a7bd5; }
          .input-group input::placeholder { color: #666; }
          .btn { padding: 12px 28px; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; text-decoration: none; display: inline-block; }
          .btn-primary { background: linear-gradient(90deg, #00d2ff, #3a7bd5); color: #fff; }
          .btn-primary:hover { opacity: 0.9; }
          .btn-secondary { background: rgba(255,255,255,0.08); color: #ccc; border: 1px solid rgba(255,255,255,0.1); }
          .btn-sm { padding: 6px 14px; font-size: 0.8rem; border-radius: 8px; }
          .domain-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin-bottom: 10px; }
          .domain-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
          .domain-name { font-size: 1.15rem; font-weight: 700; color: #fff; }
          .domain-tld { display: inline-block; padding: 2px 8px; border-radius: 6px; background: rgba(58,123,213,0.2); color: #60a5fa; font-size: 0.7rem; font-weight: 600; margin-left: 8px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
          .badge-available { background: rgba(74,222,128,0.15); color: #4ade80; }
          .badge-registered { background: rgba(248,113,113,0.15); color: #f87171; }
          .domain-reason { color: #999; font-size: 0.85rem; margin-top: 4px; }
          .section-title { font-size: 1.05rem; font-weight: 600; margin: 20px 0 12px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .section-title.available { color: #4ade80; }
          .section-title.registered { color: #f87171; }
          .keyword-tag { background: rgba(58,123,213,0.15); color: #60a5fa; padding: 3px 10px; border-radius: 16px; font-size: 0.8rem; display: inline-block; margin: 2px; }
          .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #3a7bd5; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .auth-form { max-width: 400px; margin: 40px auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
          .auth-form h2 { text-align: center; margin-bottom: 24px; color: #fff; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; margin-bottom: 6px; color: #aaa; font-size: 0.85rem; }
          .form-group input { width: 100%; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; font-size: 0.95rem; outline: none; }
          .form-group input:focus { border-color: #3a7bd5; }
          .auth-link { text-align: center; margin-top: 16px; color: #888; font-size: 0.85rem; }
          .auth-link a { color: #60a5fa; text-decoration: none; }
          .error-msg { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); border-radius: 8px; padding: 10px; color: #f87171; margin-bottom: 16px; font-size: 0.85rem; text-align: center; }
          .fav-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
          .fav-btn.active { background: rgba(250,204,21,0.15); border-color: rgba(250,204,21,0.4); color: #facc15; }
          .fav-btn:hover { border-color: #facc15; color: #facc15; }
          .news-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; margin-bottom: 10px; transition: background 0.2s; }
          .news-card:hover { background: rgba(255,255,255,0.07); }
          .news-card h3 { font-size: 1rem; color: #fff; margin-bottom: 6px; }
          .news-card h3 a { color: #fff; text-decoration: none; }
          .news-card h3 a:hover { color: #60a5fa; }
          .news-date { color: #666; font-size: 0.75rem; }
          .news-summary { color: #999; font-size: 0.85rem; margin-top: 6px; }
          .news-detail h1 { color: #fff; margin-bottom: 8px; }
          .news-detail .meta { color: #666; font-size: 0.8rem; margin-bottom: 20px; }
          .news-detail .content { color: #bbb; line-height: 1.8; }
          @media (max-width: 600px) { .input-group { flex-direction: column; } }
        `}</style>
      </head>
      <body>
        <nav>
          <div class="nav-left">
            <a href="/" class="nav-brand">FindGoodDomain</a>
            <a href="/">{i18n('home')}</a>
            <a href="/news">{i18n('news')}</a>
          </div>
          <div class="nav-right">
            {user ? (
              <>
                <span class="user-email">{user.email}</span>
                <a href="/favorites">{i18n('favorites')}</a>
                <a href="/logout">{i18n('logout')}</a>
              </>
            ) : (
              <>
                <a href="/login">{i18n('login')}</a>
                <a href="/register">{i18n('register')}</a>
              </>
            )}
            <a href={`?lang=${nextLang}`} class="lang-btn">{i18n('langLabel')}</a>
          </div>
        </nav>
        <div class="container main-content">
          {/* Google Ads placeholder */}
          <div class="ad-placeholder">[Google Ad Space - 728x90]</div>
          {children}
        </div>
        <footer>
          <p>{i18n('footer')}</p>
        </footer>
      </body>
    </html>
  )
}

export { i18nData }
export type { Lang }
