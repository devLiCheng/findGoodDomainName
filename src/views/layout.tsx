import { t, type Lang } from './i18n'

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
        <title>{title ? `${title} — ${i18n('title')}` : i18n('title')}</title>
        <meta name="description" content={i18n('subtitle')} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --bg: #0a0a0a;
            --bg-card: #111111;
            --bg-input: #161616;
            --border: #222222;
            --border-hover: #333333;
            --text: #e8e4dd;
            --text-dim: #88837c;
            --text-muted: #5c5852;
            --accent: #c8a45c;
            --accent-dim: rgba(200, 164, 92, 0.12);
            --accent-glow: rgba(200, 164, 92, 0.3);
            --green: #5a9e6f;
            --green-dim: rgba(90, 158, 111, 0.12);
            --red: #c55555;
            --red-dim: rgba(197, 85, 85, 0.1);
            --font-display: 'Playfair Display', Georgia, serif;
            --font-body: 'DM Sans', -apple-system, sans-serif;
            --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
          }
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
          html { font-size: 16px; }
          body {
            font-family: var(--font-body);
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .wrapper { max-width: 720px; margin: 0 auto; padding: 0 24px; }

          /* Top bar — ultra minimal */
          .topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 24px; position: relative; z-index: 10;
            border-bottom: 1px solid var(--border);
          }
          .topbar-brand {
            font-family: var(--font-display);
            font-size: 1.25rem; font-weight: 600; color: var(--text);
            text-decoration: none; letter-spacing: -0.3px;
          }
          .topbar-brand span { color: var(--accent); }
          .topbar-links { display: flex; align-items: center; gap: 6px; }
          .topbar-links a {
            color: var(--text-dim); text-decoration: none; font-size: 0.8rem;
            padding: 5px 10px; border-radius: 6px; transition: all 0.15s;
            letter-spacing: 0.2px;
          }
          .topbar-links a:hover { color: var(--text); background: var(--bg-card); }
          .topbar-links .user-dot {
            display: inline-block; width: 7px; height: 7px; border-radius: 50%;
            background: var(--green); margin-right: 2px; vertical-align: middle;
          }

          /* Hero section */
          .hero { padding: 100px 0 40px; text-align: center; }
          .hero-tag {
            display: inline-block; font-family: var(--font-mono); font-size: 0.7rem;
            letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
            margin-bottom: 20px; font-weight: 500;
          }
          .hero-title {
            font-family: var(--font-display); font-size: clamp(2.4rem, 5vw, 3.4rem);
            font-weight: 600; color: var(--text); line-height: 1.15;
            letter-spacing: -0.5px; margin-bottom: 12px;
          }
          .hero-title em { font-style: italic; color: var(--accent); }
          .hero-sub {
            color: var(--text-dim); font-size: 1.05rem; font-weight: 300;
            max-width: 440px; margin: 0 auto 36px; letter-spacing: 0.2px;
          }

          /* Search */
          .search-wrap { max-width: 560px; margin: 0 auto; }
          .search-bar {
            display: flex; gap: 0; border: 1px solid var(--border);
            border-radius: 12px; overflow: hidden; transition: border-color 0.2s;
            background: var(--bg-input);
          }
          .search-bar:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-dim); }
          .search-bar input {
            flex: 1; padding: 16px 20px; background: transparent; border: none;
            color: var(--text); font-size: 1rem; font-family: var(--font-body);
            outline: none;
          }
          .search-bar input::placeholder { color: var(--text-muted); }
          .search-bar button {
            padding: 16px 28px; background: var(--accent); border: none;
            color: #1a1a1a; font-family: var(--font-body); font-size: 0.9rem;
            font-weight: 600; cursor: pointer; letter-spacing: 0.3px;
            transition: filter 0.15s; white-space: nowrap;
          }
          .search-bar button:hover { filter: brightness(1.1); }
          .search-bar button:disabled { filter: brightness(0.6); cursor: not-allowed; }

          .examples-row {
            display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
            margin-top: 16px;
          }
          .examples-row .ex-label {
            color: var(--text-muted); font-size: 0.72rem; padding: 4px 0;
          }
          .examples-row button {
            background: transparent; border: 1px solid var(--border); color: var(--text-dim);
            padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 0.72rem;
            font-family: var(--font-body); transition: all 0.15s;
          }
          .examples-row button:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

          /* Results */
          .results { padding: 0 0 80px; }
          .result-section { margin-bottom: 32px; }
          .result-section h3 {
            font-family: var(--font-display); font-size: 1.15rem; font-weight: 600;
            margin-bottom: 16px; letter-spacing: -0.2px;
          }
          .result-section h3.green { color: var(--green); }
          .result-section h3.red { color: var(--red); }

          .domain-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 10px; padding: 18px 20px; margin-bottom: 10px;
            transition: border-color 0.15s;
          }
          .domain-card:hover { border-color: var(--border-hover); }
          .dc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
          .dc-domain {
            font-family: var(--font-mono); font-size: 1rem; font-weight: 500;
            color: var(--text); letter-spacing: -0.2px;
          }
          .dc-tld {
            display: inline-block; padding: 2px 7px; border-radius: 4px;
            background: var(--accent-dim); color: var(--accent); font-size: 0.65rem;
            font-weight: 600; margin-left: 8px; vertical-align: middle;
            font-family: var(--font-body); letter-spacing: 0.3px;
          }
          .dc-right { display: flex; align-items: center; gap: 10px; }
          .dc-badge {
            padding: 3px 10px; border-radius: 20px; font-size: 0.68rem;
            font-weight: 600; letter-spacing: 0.3px;
          }
          .dc-badge.green { background: var(--green-dim); color: var(--green); }
          .dc-badge.red { background: var(--red-dim); color: var(--red); }
          .dc-reason { color: var(--text-dim); font-size: 0.85rem; line-height: 1.5; }
          .dc-fav {
            background: none; border: 1px solid var(--border); color: var(--text-muted);
            padding: 3px 10px; border-radius: 6px; cursor: pointer; font-size: 0.7rem;
            font-family: var(--font-body); transition: all 0.15s;
          }
          .dc-fav:hover { border-color: var(--accent); color: var(--accent); }
          .dc-fav.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

          .kw-tag {
            display: inline-block; padding: 3px 10px; border-radius: 6px;
            background: var(--accent-dim); color: var(--accent); font-size: 0.75rem;
            margin: 2px 4px 12px 0; font-family: var(--font-mono);
          }

          /* Loading / Error / Empty */
          .status-box { text-align: center; padding: 60px 20px; }
          .status-box p { color: var(--text-dim); margin-top: 16px; font-size: 0.9rem; }
          .spinner {
            width: 40px; height: 40px; border: 2px solid var(--border);
            border-top-color: var(--accent); border-radius: 50%;
            animation: spin 0.7s linear infinite; margin: 0 auto;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .error-box {
            background: var(--red-dim); border: 1px solid rgba(197,85,85,0.3);
            border-radius: 10px; padding: 16px 20px; text-align: center;
            color: var(--red); font-size: 0.9rem;
          }

          /* Auth forms */
          .auth-wrap {
            max-width: 380px; margin: 80px auto;
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 12px; padding: 36px;
          }
          .auth-wrap h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; margin-bottom: 28px; text-align: center; letter-spacing: -0.3px; }
          .form-group { margin-bottom: 18px; }
          .form-group label { display: block; margin-bottom: 6px; color: var(--text-dim); font-size: 0.82rem; }
          .form-group input {
            width: 100%; padding: 12px 14px; background: var(--bg-input);
            border: 1px solid var(--border); border-radius: 8px; color: var(--text);
            font-size: 0.95rem; font-family: var(--font-body); outline: none;
            transition: border-color 0.15s;
          }
          .form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
          .btn {
            display: inline-block; padding: 12px 24px; border: none; border-radius: 8px;
            font-family: var(--font-body); font-size: 0.9rem; font-weight: 600;
            cursor: pointer; transition: filter 0.15s; text-decoration: none;
          }
          .btn-primary { background: var(--accent); color: #1a1a1a; width: 100%; }
          .btn-primary:hover { filter: brightness(1.1); }
          .btn-ghost {
            background: transparent; color: var(--text-dim); border: 1px solid var(--border);
            padding: 8px 16px; font-size: 0.78rem; font-weight: 500; border-radius: 6px;
          }
          .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
          .auth-link { text-align: center; margin-top: 18px; color: var(--text-muted); font-size: 0.82rem; }
          .auth-link a { color: var(--accent); text-decoration: none; }

          /* News page */
          .news-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 10px; padding: 20px; margin-bottom: 12px;
            transition: border-color 0.15s;
          }
          .news-card:hover { border-color: var(--border-hover); }
          .news-card h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; letter-spacing: -0.2px; }
          .news-card h3 a { color: var(--text); text-decoration: none; }
          .news-card h3 a:hover { color: var(--accent); }
          .news-card .n-date { color: var(--text-muted); font-size: 0.72rem; }
          .news-card .n-summary { color: var(--text-dim); font-size: 0.85rem; margin-top: 6px; }

          /* News detail */
          .news-detail h1 { font-family: var(--font-display); font-size: 1.8rem; font-weight: 600; margin-bottom: 6px; letter-spacing: -0.4px; }
          .news-detail .nd-meta { color: var(--text-muted); font-size: 0.78rem; margin-bottom: 28px; }
          .news-detail .nd-body { color: var(--text-dim); line-height: 1.85; font-size: 0.95rem; }

          /* Footer — ultra minimal */
          .site-footer {
            text-align: center; padding: 32px 24px;
            border-top: 1px solid var(--border);
            color: var(--text-muted); font-size: 0.7rem;
            letter-spacing: 0.3px; display: flex; align-items: center;
            justify-content: center; gap: 18px; flex-wrap: wrap;
          }
          .site-footer a { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
          .site-footer a:hover { color: var(--accent); }
          .site-footer .sep { color: var(--border); }

          /* Favorites page */
          .page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; margin-bottom: 24px; letter-spacing: -0.3px; }

          @media (max-width: 600px) {
            .hero { padding: 60px 0 30px; }
            .search-bar { flex-direction: column; }
            .search-bar button { border-radius: 0 0 12px 12px; }
            .topbar { padding: 14px 16px; flex-wrap: wrap; gap: 8px; }
            .dc-top { flex-wrap: wrap; gap: 8px; }
          }
        `}</style>
      </head>
      <body>
        {/* Top bar */}
        <div class="topbar">
          <a href="/" class="topbar-brand">Find<span>Good</span>Domain</a>
          <div class="topbar-links">
            {user ? (
              <>
                <span class="user-dot"></span>
                <a href="/favorites">{i18n('favorites')}</a>
                <a href="/logout">{i18n('logout')}</a>
              </>
            ) : (
              <>
                <a href="/login">{i18n('login')}</a>
                <a href="/register">{i18n('register')}</a>
              </>
            )}
            <a href={`?lang=${nextLang}`} style="font-family:var(--font-mono);font-size:0.7rem;font-weight:500;">{nextLang.toUpperCase()}</a>
          </div>
        </div>

        {children}

        {/* Footer — news link small */}
        <div class="site-footer">
          <span>{i18n('footer')}</span>
          <span class="sep">·</span>
          <a href="/">{i18n('home')}</a>
          <span class="sep">·</span>
          <a href="/news">{i18n('news')}</a>
        </div>
      </body>
    </html>
  )
}
