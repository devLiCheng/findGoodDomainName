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
        <style>{`
          :root {
            --bg: #060608;
            --bg-card: #0e0e12;
            --bg-input: #141418;
            --border: #1e1e28;
            --border-hover: #2a2a38;
            --text: #ece6f0;
            --text-dim: #9e96a8;
            --text-muted: #5c5666;
            --accent: #a78bfa;
            --accent-2: #7dd3fc;
            --accent-3: #f472b6;
            --accent-dim: rgba(167, 139, 250, 0.10);
            --accent-glow: rgba(167, 139, 250, 0.25);
            --green: #6ee7a8;
            --green-dim: rgba(110, 231, 168, 0.10);
            --red: #fca5a5;
            --red-dim: rgba(252, 165, 165, 0.08);
            --font-display: Georgia, 'Noto Serif SC', serif;
            --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            --font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
          }

          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

          html { font-size: 16px; scroll-behavior: smooth; }

          body {
            font-family: var(--font-body);
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
          }

          /* Animated background grid */
          .bg-grid {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 70%);
          }

          /* Floating orbs */
          .orb { position: fixed; border-radius: 50%; filter: blur(90px); opacity: 0.15; pointer-events: none; z-index: 0; }
          .orb-1 { width: 500px; height: 500px; background: var(--accent); top: -200px; left: -100px; animation: orb1 12s ease-in-out infinite; }
          .orb-2 { width: 400px; height: 400px; background: var(--accent-2); top: 40%; right: -150px; animation: orb2 15s ease-in-out infinite; }
          .orb-3 { width: 350px; height: 350px; background: var(--accent-3); bottom: -100px; left: 30%; animation: orb3 18s ease-in-out infinite; }
          @keyframes orb1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(80px,60px) scale(1.1); } 66% { transform: translate(-40px,-30px) scale(0.9); } }
          @keyframes orb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,80px) scale(1.15); } }
          @keyframes orb3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(50px,-70px) scale(1.1); } }

          .wrapper { max-width: 760px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

          /* Top bar - glass */
          .topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 24px; position: sticky; top: 0; z-index: 100;
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            background: rgba(6,6,8,0.7);
            border-bottom: 1px solid rgba(255,255,255,0.04);
          }
          .topbar-brand {
            font-family: var(--font-display); font-size: 1.3rem; font-weight: 600;
            color: var(--text); text-decoration: none; letter-spacing: -0.4px;
          }
          .topbar-brand span {
            background: linear-gradient(135deg, var(--accent), var(--accent-3));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .topbar-links { display: flex; align-items: center; gap: 4px; }
          .topbar-links a {
            color: var(--text-dim); text-decoration: none; font-size: 0.78rem;
            padding: 6px 12px; border-radius: 8px; transition: all 0.2s;
            letter-spacing: 0.3px; position: relative;
          }
          .topbar-links a:hover { color: var(--text); background: rgba(255,255,255,0.04); }
          .topbar-links .lang-btn {
            font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500;
            border: 1px solid var(--border); color: var(--text-dim);
          }
          .topbar-links .lang-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

          /* Hero */
          .hero { padding: 100px 0 50px; text-align: center; position: relative; z-index: 1; }
          .hero-tag {
            display: inline-block; font-family: var(--font-mono); font-size: 0.68rem;
            letter-spacing: 3px; text-transform: uppercase;
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; margin-bottom: 24px; font-weight: 600;
            animation: fadeInUp 0.6s ease-out;
          }
          .hero-title {
            font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 4rem);
            font-weight: 700; color: var(--text); line-height: 1.1;
            letter-spacing: -0.8px; margin-bottom: 16px;
            animation: fadeInUp 0.6s ease-out 0.1s both;
          }
          .hero-title em {
            font-style: italic;
            background: linear-gradient(135deg, var(--accent), var(--accent-3), var(--accent-2));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-sub {
            color: var(--text-dim); font-size: 1.05rem; font-weight: 300;
            max-width: 460px; margin: 0 auto 40px; letter-spacing: 0.3px;
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Search bar - floating glass */
          .search-wrap { max-width: 580px; margin: 0 auto; animation: fadeInUp 0.6s ease-out 0.3s both; }
          .search-bar {
            display: flex; gap: 0; border-radius: 16px; overflow: hidden;
            background: var(--bg-input); border: 1px solid var(--border);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          .search-bar::before {
            content: ''; position: absolute; inset: -1px; border-radius: 16px;
            background: linear-gradient(135deg, var(--accent), transparent, var(--accent-3), transparent);
            opacity: 0; transition: opacity 0.4s; z-index: -1;
          }
          .search-bar:focus-within::before { opacity: 0.5; }
          .search-bar:focus-within {
            border-color: transparent;
            box-shadow: 0 0 40px var(--accent-glow), 0 0 80px rgba(167,139,250,0.1);
          }
          .search-bar input {
            flex: 1; padding: 18px 22px; background: transparent; border: none;
            color: var(--text); font-size: 1rem; font-family: var(--font-body);
            outline: none; letter-spacing: 0.2px;
          }
          .search-bar input::placeholder { color: var(--text-muted); }
          .search-bar button {
            padding: 18px 32px; background: linear-gradient(135deg, var(--accent), #8b5cf6);
            border: none; color: #fff; font-family: var(--font-body); font-size: 0.9rem;
            font-weight: 600; cursor: pointer; letter-spacing: 0.5px;
            transition: all 0.3s; position: relative; overflow: hidden;
          }
          .search-bar button::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(135deg, var(--accent-3), var(--accent));
            opacity: 0; transition: opacity 0.3s;
          }
          .search-bar button:hover::after { opacity: 1; }
          .search-bar button span { position: relative; z-index: 1; }
          .search-bar button:disabled { opacity: 0.5; cursor: not-allowed; }
          .search-bar button:disabled::after { display: none; }

          .examples-row {
            display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
            margin-top: 18px;
          }
          .examples-row .ex-label { color: var(--text-muted); font-size: 0.7rem; padding: 5px 0; }
          .examples-row button {
            background: transparent; border: 1px solid var(--border); color: var(--text-dim);
            padding: 5px 14px; border-radius: 20px; cursor: pointer; font-size: 0.72rem;
            font-family: var(--font-body); transition: all 0.2s;
          }
          .examples-row button:hover {
            border-color: var(--accent); color: var(--accent);
            background: var(--accent-dim); transform: translateY(-1px);
          }

          /* Results */
          .results { padding: 0 0 100px; min-height: 200px; }
          .result-section { margin-bottom: 36px; }
          .result-section h3 {
            font-family: var(--font-display); font-size: 1.2rem; font-weight: 600;
            margin-bottom: 18px; letter-spacing: -0.3px;
            display: flex; align-items: center; gap: 10px;
          }
          .result-section h3::before {
            content: ''; display: inline-block; width: 6px; height: 6px;
            border-radius: 50%;
          }
          .result-section h3.green { color: var(--green); }
          .result-section h3.green::before { background: var(--green); box-shadow: 0 0 8px var(--green); }
          .result-section h3.red { color: var(--red); }
          .result-section h3.red::before { background: var(--red); box-shadow: 0 0 8px var(--red); }

          .domain-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 12px; padding: 20px 22px; margin-bottom: 10px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden;
            animation: cardIn 0.4s ease-out both;
          }
          .domain-card:nth-child(1) { animation-delay: 0s; }
          .domain-card:nth-child(2) { animation-delay: 0.05s; }
          .domain-card:nth-child(3) { animation-delay: 0.1s; }
          .domain-card:nth-child(4) { animation-delay: 0.15s; }
          .domain-card:nth-child(5) { animation-delay: 0.2s; }
          .domain-card:nth-child(6) { animation-delay: 0.25s; }
          .domain-card:nth-child(7) { animation-delay: 0.3s; }
          .domain-card:nth-child(8) { animation-delay: 0.35s; }
          .domain-card:nth-child(9) { animation-delay: 0.4s; }
          .domain-card:nth-child(10) { animation-delay: 0.45s; }
          .domain-card:nth-child(11) { animation-delay: 0.5s; }
          .domain-card:nth-child(12) { animation-delay: 0.55s; }

          @keyframes cardIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .domain-card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 0;
            background: linear-gradient(to bottom, var(--accent), var(--accent-3));
            transition: height 0.3s ease; border-radius: 0 3px 3px 0;
          }
          .domain-card:hover { border-color: var(--border-hover); transform: translateX(4px); }
          .domain-card:hover::before { height: 100%; }

          .dc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
          .dc-domain {
            font-family: var(--font-mono); font-size: 1.05rem; font-weight: 500;
            color: var(--text); letter-spacing: -0.3px;
          }
          .dc-tld {
            display: inline-block; padding: 2px 8px; border-radius: 5px;
            background: var(--accent-dim); color: var(--accent); font-size: 0.65rem;
            font-weight: 600; margin-left: 8px; vertical-align: middle;
            font-family: var(--font-body); letter-spacing: 0.4px;
          }
          .dc-right { display: flex; align-items: center; gap: 10px; }
          .dc-badge {
            padding: 4px 12px; border-radius: 20px; font-size: 0.68rem;
            font-weight: 600; letter-spacing: 0.4px;
          }
          .dc-badge.green { background: var(--green-dim); color: var(--green); border: 1px solid rgba(110,231,168,0.2); }
          .dc-badge.red { background: var(--red-dim); color: var(--red); border: 1px solid rgba(252,165,165,0.15); }
          .dc-reason { color: var(--text-dim); font-size: 0.85rem; line-height: 1.55; }

          .dc-fav {
            background: none; border: 1px solid var(--border); color: var(--text-muted);
            padding: 4px 12px; border-radius: 7px; cursor: pointer; font-size: 0.7rem;
            font-family: var(--font-body); transition: all 0.2s;
          }
          .dc-fav:hover { border-color: var(--accent); color: var(--accent); }
          .dc-fav.active {
            border-color: #fbbf24; color: #fbbf24;
            background: rgba(251,191,36,0.08);
            box-shadow: 0 0 12px rgba(251,191,36,0.15);
          }

          .kw-tag {
            display: inline-block; padding: 4px 12px; border-radius: 7px;
            background: var(--accent-dim); color: var(--accent);
            font-size: 0.75rem; margin: 2px 4px 14px 0;
            font-family: var(--font-mono); border: 1px solid rgba(167,139,250,0.1);
          }

          .status-box { text-align: center; padding: 80px 20px; }
          .status-box p { color: var(--text-dim); margin-top: 18px; font-size: 0.9rem; }
          .spinner {
            width: 44px; height: 44px; border: 2px solid var(--border);
            border-top-color: var(--accent); border-radius: 50%;
            animation: spin 0.7s linear infinite; margin: 0 auto;
            box-shadow: 0 0 20px rgba(167,139,250,0.2);
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          .error-box {
            background: var(--red-dim); border: 1px solid rgba(252,165,165,0.25);
            border-radius: 12px; padding: 18px 22px; text-align: center;
            color: var(--red); font-size: 0.9rem;
          }

          .auth-wrap {
            max-width: 400px; margin: 80px auto;
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 16px; padding: 40px;
          }
          .auth-wrap h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; text-align: center; letter-spacing: -0.3px; }
          .form-group { margin-bottom: 20px; }
          .form-group label { display: block; margin-bottom: 6px; color: var(--text-dim); font-size: 0.82rem; }
          .form-group input {
            width: 100%; padding: 13px 16px; background: var(--bg-input);
            border: 1px solid var(--border); border-radius: 10px; color: var(--text);
            font-size: 0.95rem; font-family: var(--font-body); outline: none;
            transition: all 0.2s;
          }
          .form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
          .btn {
            display: inline-block; padding: 13px 28px; border: none; border-radius: 10px;
            font-family: var(--font-body); font-size: 0.9rem; font-weight: 600;
            cursor: pointer; transition: all 0.2s; text-decoration: none; letter-spacing: 0.3px;
          }
          .btn-primary {
            background: linear-gradient(135deg, var(--accent), #8b5cf6); color: #fff; width: 100%;
            box-shadow: 0 4px 20px rgba(167,139,250,0.3);
          }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(167,139,250,0.4); }
          .btn-ghost {
            background: transparent; color: var(--text-dim); border: 1px solid var(--border);
            padding: 8px 18px; font-size: 0.78rem; font-weight: 500; border-radius: 8px;
          }
          .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
          .auth-link { text-align: center; margin-top: 20px; color: var(--text-muted); font-size: 0.83rem; }
          .auth-link a { color: var(--accent); text-decoration: none; }

          .page-title { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; margin-bottom: 28px; letter-spacing: -0.4px; }

          .news-card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 12px; padding: 22px; margin-bottom: 12px;
            transition: all 0.2s ease;
          }
          .news-card:hover { border-color: var(--border-hover); transform: translateX(4px); }
          .news-card h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; margin-bottom: 6px; letter-spacing: -0.2px; }
          .news-card h3 a { color: var(--text); text-decoration: none; }
          .news-card h3 a:hover { color: var(--accent); }
          .news-card .n-date { color: var(--text-muted); font-size: 0.72rem; }
          .news-card .n-summary { color: var(--text-dim); font-size: 0.86rem; margin-top: 8px; }

          .news-detail h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
          .news-detail .nd-meta { color: var(--text-muted); font-size: 0.78rem; margin-bottom: 30px; }
          .news-detail .nd-body { color: var(--text-dim); line-height: 1.9; font-size: 0.96rem; }

          .site-footer {
            text-align: center; padding: 32px 24px;
            border-top: 1px solid var(--border);
            color: var(--text-muted); font-size: 0.7rem;
            letter-spacing: 0.4px; display: flex; align-items: center;
            justify-content: center; gap: 20px; flex-wrap: wrap;
            position: relative; z-index: 1;
          }
          .site-footer a { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
          .site-footer a:hover { color: var(--accent); }
          .site-footer .sep { color: var(--border); }

          @media (max-width: 600px) {
            .hero { padding: 60px 0 30px; }
            .hero-title { font-size: 2rem; }
            .search-bar { flex-direction: column; }
            .search-bar button { border-radius: 0 0 16px 16px; }
            .topbar { padding: 12px 16px; flex-wrap: wrap; gap: 8px; }
            .dc-top { flex-wrap: wrap; gap: 8px; }
            .orb { display: none; }
            .bg-grid { background-size: 40px 40px; }
          }
        `}</style>
      </head>
      <body>
        <div class="bg-grid"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <div class="topbar">
          <a href="/" class="topbar-brand">Find<span>Good</span>Domain</a>
          <div class="topbar-links">
            {user ? (
              <>
                <a href="/favorites">{i18n('favorites')}</a>
                <a href="/logout">{i18n('logout')}</a>
              </>
            ) : (
              <>
                <a href="/login">{i18n('login')}</a>
                <a href="/register">{i18n('register')}</a>
              </>
            )}
            <a href={`?lang=${nextLang}`} class="lang-btn">{nextLang.toUpperCase()}</a>
          </div>
        </div>

        {children}

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
