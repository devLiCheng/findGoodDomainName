import { t, type Lang } from './i18n'

interface LayoutProps {
  children: any
  title?: string
  user?: { id: number; email: string; nickname: string; avatar: string } | null
  lang?: Lang
}

export function Layout({ children, title, user, lang = 'zh' }: LayoutProps) {
  const i18n = (key: string) => t(lang, key)
  const nextLang = lang === 'zh' ? 'en' : 'zh'

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} — ${i18n('title')}` : i18n('title')}</title>
        <meta name="description" content={i18n('subtitle')} />
        <style>{css}</style>
      </head>
      <body>
        <div class="topbar">
          <a href="/" class="topbar-brand">Find<span>Good</span>Domain</a>
          <div class="topbar-links">
            {user ? (
              <>
                <a href="/profile" class="profile-link">
                  <span class="avatar-sm">{user.nickname ? user.nickname[0]!.toUpperCase() : user.email[0]!.toUpperCase()}</span>
                  {user.nickname || user.email.split('@')[0]}
                </a>
                <a href="/logout">{i18n('logout')}</a>
              </>
            ) : (
              <a href="/login">{i18n('signin')}</a>
            )}
            <a href={`?lang=${nextLang}`} class="lang-btn">{nextLang.toUpperCase()}</a>
          </div>
        </div>
        {children}
        <div class="site-footer">
          <span>{i18n('footer')}</span>
          <span class="sep">·</span>
          <a href="/news">{i18n('news')}</a>
        </div>
      </body>
    </html>
  )
}

const css = `
:root {
  --bg: #060608; --bg-card: #0e0e12; --bg-input: #141418;
  --border: #1e1e28; --border-hover: #2a2a38;
  --text: #ece6f0; --text-dim: #9e96a8; --text-muted: #5c5666;
  --accent: #a78bfa; --accent-2: #7dd3fc; --accent-3: #f472b6;
  --accent-dim: rgba(167,139,250,0.10);
  --green: #6ee7a8; --green-dim: rgba(110,231,168,0.10);
  --red: #fca5a5; --red-dim: rgba(252,165,165,0.08);
  --font-display: Georgia, 'Noto Serif SC', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px;scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);min-height:100vh;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.wrapper{max-width:760px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(6,6,8,.65);border-bottom:1px solid rgba(255,255,255,.03)}
.topbar-brand{font-family:var(--font-display);font-size:1.25rem;font-weight:600;color:var(--text);text-decoration:none;letter-spacing:-.4px}
.topbar-brand span{background:linear-gradient(135deg,var(--accent),var(--accent-3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.topbar-links{display:flex;align-items:center;gap:2px}
.topbar-links a{color:var(--text-dim);text-decoration:none;font-size:.76rem;padding:6px 12px;border-radius:8px;transition:all .15s;letter-spacing:.2px}
.topbar-links a:hover{color:var(--text);background:rgba(255,255,255,.04)}
.topbar-links .lang-btn{font-family:var(--font-mono);font-size:.65rem;font-weight:500;border:1px solid var(--border);color:var(--text-dim)}
.topbar-links .lang-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
.profile-link{display:flex;align-items:center;gap:6px}
.avatar-sm{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-3));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;font-family:var(--font-body)}

.hero{padding:90px 0 40px;text-align:center}
.hero-tag{display:inline-block;font-family:var(--font-mono);font-size:.65rem;letter-spacing:3px;text-transform:uppercase;background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:22px;font-weight:600;animation:fadeInUp .5s ease-out}
.hero-title{font-family:var(--font-display);font-size:clamp(2.6rem,5.5vw,3.8rem);font-weight:700;color:var(--text);line-height:1.1;letter-spacing:-.7px;margin-bottom:14px;animation:fadeInUp .5s ease-out .08s both}
.hero-title em{font-style:italic;background:linear-gradient(135deg,var(--accent),var(--accent-3),var(--accent-2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{color:var(--text-dim);font-size:1rem;font-weight:300;max-width:460px;margin:0 auto 36px;letter-spacing:.2px;animation:fadeInUp .5s ease-out .16s both}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.search-wrap{max-width:560px;margin:0 auto;animation:fadeInUp .5s ease-out .24s both}
.search-bar{display:flex;gap:0;border-radius:14px;overflow:hidden;background:var(--bg-input);border:1px solid var(--border);transition:all .25s}
.search-bar:focus-within{border-color:var(--accent);box-shadow:0 0 30px var(--accent-dim)}
.search-bar input{flex:1;padding:17px 20px;background:transparent;border:none;color:var(--text);font-size:.95rem;font-family:var(--font-body);outline:none}
.search-bar input::placeholder{color:var(--text-muted)}
.search-bar button{padding:17px 30px;background:linear-gradient(135deg,var(--accent),#8b5cf6);border:none;color:#fff;font-family:var(--font-body);font-size:.88rem;font-weight:600;cursor:pointer;letter-spacing:.4px;transition:filter .15s}
.search-bar button:hover{filter:brightness(1.1)}
.search-bar button:disabled{filter:brightness(.5);cursor:not-allowed}

.examples-row{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:16px}
.examples-row .ex-label{color:var(--text-muted);font-size:.68rem;padding:4px 0}
.examples-row button{background:transparent;border:1px solid var(--border);color:var(--text-dim);padding:4px 13px;border-radius:20px;cursor:pointer;font-size:.7rem;font-family:var(--font-body);transition:all .15s}
.examples-row button:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

.results{padding:0 0 80px;min-height:160px}
.result-section{margin-bottom:32px}
.result-section h3{font-family:var(--font-display);font-size:1.15rem;font-weight:600;margin-bottom:16px;letter-spacing:-.3px;display:flex;align-items:center;gap:8px}
.result-section h3::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%}
.result-section h3.green{color:var(--green)} .result-section h3.green::before{background:var(--green);box-shadow:0 0 6px var(--green)}
.result-section h3.red{color:var(--red)} .result-section h3.red::before{background:var(--red);box-shadow:0 0 6px var(--red)}

.domain-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin-bottom:8px;transition:all .2s;animation:cardIn .35s ease-out both}
.domain-card:nth-child(1){animation-delay:0s} .domain-card:nth-child(2){animation-delay:.04s} .domain-card:nth-child(3){animation-delay:.08s} .domain-card:nth-child(4){animation-delay:.12s} .domain-card:nth-child(5){animation-delay:.16s} .domain-card:nth-child(6){animation-delay:.2s} .domain-card:nth-child(7){animation-delay:.24s} .domain-card:nth-child(8){animation-delay:.28s} .domain-card:nth-child(9){animation-delay:.32s} .domain-card:nth-child(10){animation-delay:.36s} .domain-card:nth-child(11){animation-delay:.4s} .domain-card:nth-child(12){animation-delay:.44s}
@keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.domain-card:hover{border-color:var(--border-hover);transform:translateX(3px)}
.dc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.dc-domain{font-family:var(--font-mono);font-size:1rem;font-weight:500;color:var(--text);letter-spacing:-.2px}
.dc-tld{display:inline-block;padding:2px 7px;border-radius:4px;background:var(--accent-dim);color:var(--accent);font-size:.62rem;font-weight:600;margin-left:7px;vertical-align:middle;font-family:var(--font-body)}
.dc-right{display:flex;align-items:center;gap:8px}
.dc-badge{padding:3px 10px;border-radius:20px;font-size:.65rem;font-weight:600}
.dc-badge.green{background:var(--green-dim);color:var(--green);border:1px solid rgba(110,231,168,.15)}
.dc-badge.red{background:var(--red-dim);color:var(--red);border:1px solid rgba(252,165,165,.12)}
.dc-reason{color:var(--text-dim);font-size:.82rem;line-height:1.5}
.dc-fav{background:none;border:1px solid var(--border);color:var(--text-muted);padding:3px 10px;border-radius:6px;cursor:pointer;font-size:.68rem;font-family:var(--font-body);transition:all .15s}
.dc-fav:hover{border-color:var(--accent);color:var(--accent)}
.dc-fav.active{border-color:#fbbf24;color:#fbbf24;background:rgba(251,191,36,.08);box-shadow:0 0 10px rgba(251,191,36,.1)}
.kw-tag{display:inline-block;padding:3px 10px;border-radius:6px;background:var(--accent-dim);color:var(--accent);font-size:.72rem;margin:2px 4px 12px 0;font-family:var(--font-mono);border:1px solid rgba(167,139,250,.08)}

.status-box{text-align:center;padding:70px 20px}
.status-box p{color:var(--text-dim);margin-top:16px;font-size:.88rem}
.spinner{width:40px;height:40px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto;box-shadow:0 0 16px rgba(167,139,250,.15)}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{background:var(--red-dim);border:1px solid rgba(252,165,165,.2);border-radius:10px;padding:16px 20px;text-align:center;color:var(--red);font-size:.88rem}

.auth-wrap{max-width:400px;margin:80px auto;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:40px}
.auth-wrap h2{font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin-bottom:28px;text-align:center;letter-spacing:-.3px}
.form-group{margin-bottom:18px}
.form-group label{display:block;margin-bottom:5px;color:var(--text-dim);font-size:.8rem}
.form-group input{width:100%;padding:12px 15px;background:var(--bg-input);border:1px solid var(--border);border-radius:9px;color:var(--text);font-size:.92rem;font-family:var(--font-body);outline:none;transition:border-color .15s}
.form-group input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim)}
.btn{display:inline-block;padding:12px 26px;border:none;border-radius:9px;font-family:var(--font-body);font-size:.88rem;font-weight:600;cursor:pointer;transition:all .15s;text-decoration:none;letter-spacing:.2px}
.btn-primary{background:linear-gradient(135deg,var(--accent),#8b5cf6);color:#fff;width:100%}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--text-dim);border:1px solid var(--border);padding:7px 16px;font-size:.75rem;font-weight:500;border-radius:7px}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.auth-hint{text-align:center;margin-top:16px;color:var(--text-muted);font-size:.78rem}

.page-title{font-family:var(--font-display);font-size:1.5rem;font-weight:700;margin-bottom:24px;letter-spacing:-.4px}

/* Profile */
.profile-wrap{max-width:500px;margin:40px auto}
.profile-header{display:flex;align-items:center;gap:20px;margin-bottom:32px}
.avatar-lg{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-3));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;font-family:var(--font-body);flex-shrink:0}
.avatar-lg-img{width:64px;height:64px;border-radius:50%;object-fit:cover}
.avatar-container{position:relative;cursor:pointer;display:inline-block;flex-shrink:0}
.avatar-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:600;opacity:0;transition:opacity .15s}
.avatar-container:hover .avatar-overlay{opacity:1}
.profile-info h2{font-size:1.3rem;font-weight:600;margin-bottom:2px}
.profile-info p{color:var(--text-dim);font-size:.82rem}
.profile-edit{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px}
.profile-edit h3{font-size:1rem;font-weight:600;margin-bottom:16px;color:var(--text)}
.profile-actions{display:flex;gap:8px;margin-top:16px}

.news-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:10px;transition:all .15s}
.news-card:hover{border-color:var(--border-hover);transform:translateX(3px)}
.news-card h3{font-family:var(--font-display);font-size:1.05rem;font-weight:600;margin-bottom:4px;letter-spacing:-.2px}
.news-card h3 a{color:var(--text);text-decoration:none}
.news-card h3 a:hover{color:var(--accent)}
.news-card .n-date{color:var(--text-muted);font-size:.7rem}
.news-card .n-summary{color:var(--text-dim);font-size:.84rem;margin-top:6px}
.news-detail h1{font-family:var(--font-display);font-size:1.8rem;font-weight:700;margin-bottom:6px;letter-spacing:-.4px}
.news-detail .nd-meta{color:var(--text-muted);font-size:.75rem;margin-bottom:28px}
.news-detail .nd-body{color:var(--text-dim);line-height:1.85;font-size:.92rem}

.site-footer{text-align:center;padding:20px 24px 30px;color:var(--text-muted);font-size:.65rem;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;opacity:.4}
.site-footer a{color:var(--text-muted);text-decoration:none;transition:color .15s}
.site-footer a:hover{color:var(--accent)}
.site-footer .sep{opacity:.3}

@media(max-width:600px){
  .hero{padding:50px 0 24px}
  .hero-title{font-size:1.9rem}
  .search-bar{flex-direction:column}
  .search-bar button{border-radius:0 0 14px 14px}
  .topbar{padding:12px 16px;flex-wrap:wrap;gap:6px}
  .dc-top{flex-wrap:wrap;gap:6px}
  .profile-header{flex-direction:column;text-align:center}
}
`
