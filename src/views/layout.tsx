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
  const initial = user ? (user.nickname || user.email)[0]!.toUpperCase() : ''

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
                <a href="/profile" class="avatar-link" title={user.nickname || user.email}>
                  {user.avatar
                    ? <img class="avatar-nav" src={user.avatar} alt="" />
                    : <span class="avatar-nav-fallback">{initial}</span>
                  }
                </a>
                <a href="/logout" class="logout-link">{i18n('logout')}</a>
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
:root{--bg:#060608;--bg-card:#0e0e12;--bg-input:#141418;--border:#1e1e28;--border-hover:#2a2a38;--text:#ece6f0;--text-dim:#9e96a8;--text-muted:#5c5666;--accent:#a78bfa;--accent-2:#7dd3fc;--accent-3:#f472b6;--accent-dim:rgba(167,139,250,0.10);--green:#6ee7a8;--green-dim:rgba(110,231,168,0.10);--red:#fca5a5;--red-dim:rgba(252,165,165,0.08);--font-display:Georgia,'Noto Serif SC',serif;--font-body:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;--font-mono:'SF Mono','Cascadia Code','Consolas',monospace}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);min-height:100vh;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.wrapper{max-width:760px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(6,6,8,.65);border-bottom:1px solid rgba(255,255,255,.03)}
.topbar-brand{font-family:var(--font-display);font-size:1.2rem;font-weight:600;color:var(--text);text-decoration:none;letter-spacing:-.4px}
.topbar-brand span{background:linear-gradient(135deg,var(--accent),var(--accent-3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.topbar-links{display:flex;align-items:center;gap:4px}
.topbar-links a{color:var(--text-dim);text-decoration:none;font-size:.74rem;padding:5px 10px;border-radius:8px;transition:all .12s}
.topbar-links a:hover{color:var(--text)}
.topbar-links .lang-btn{font-family:var(--font-mono);font-size:.62rem;font-weight:500;border:1px solid var(--border)}
.topbar-links .lang-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
.avatar-link{display:flex;align-items:center;padding:2px!important}
.avatar-nav{width:28px;height:28px;border-radius:50%;object-fit:cover}
.avatar-nav-fallback{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-3));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;font-family:var(--font-body)}
.logout-link{font-size:.7rem!important;opacity:.5}
.logout-link:hover{opacity:1}

.hero{padding:80px 0 32px;text-align:center}
.hero-tag{display:inline-block;font-family:var(--font-mono);font-size:.62rem;letter-spacing:3px;text-transform:uppercase;background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;font-weight:600}
.hero-title{font-family:var(--font-display);font-size:clamp(2.4rem,5vw,3.6rem);font-weight:700;color:var(--text);line-height:1.1;letter-spacing:-.6px;margin-bottom:12px}
.hero-title em{font-style:italic;background:linear-gradient(135deg,var(--accent),var(--accent-3),var(--accent-2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{color:var(--text-dim);font-size:.95rem;font-weight:300;max-width:440px;margin:0 auto 32px;letter-spacing:.2px}

.search-wrap{max-width:540px;margin:0 auto}
.search-bar{display:flex;gap:0;border-radius:13px;overflow:hidden;background:var(--bg-input);border:1px solid var(--border);transition:all .2s}
.search-bar:focus-within{border-color:var(--accent);box-shadow:0 0 24px var(--accent-dim)}
.search-bar input{flex:1;padding:16px 20px;background:transparent;border:none;color:var(--text);font-size:.92rem;font-family:var(--font-body);outline:none}
.search-bar input::placeholder{color:var(--text-muted)}
.search-bar button{padding:16px 28px;background:linear-gradient(135deg,var(--accent),#8b5cf6);border:none;color:#fff;font-family:var(--font-body);font-size:.85rem;font-weight:600;cursor:pointer;letter-spacing:.3px;transition:filter .12s}
.search-bar button:hover{filter:brightness(1.08)}
.search-bar button:disabled{filter:brightness(.5);cursor:not-allowed}

.examples-row{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:14px}
.examples-row .ex-label{color:var(--text-muted);font-size:.65rem;padding:3px 0}
.examples-row button{background:transparent;border:1px solid var(--border);color:var(--text-dim);padding:3px 12px;border-radius:20px;cursor:pointer;font-size:.68rem;font-family:var(--font-body);transition:all .12s}
.examples-row button:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

.results{padding:0 0 70px;min-height:120px}
.result-section{margin-bottom:28px}
.result-section h3{font-family:var(--font-display);font-size:1.1rem;font-weight:600;margin-bottom:14px;letter-spacing:-.2px;display:flex;align-items:center;gap:8px}
.result-section h3::before{content:'';display:inline-block;width:4px;height:4px;border-radius:50%}
.result-section h3.green{color:var(--green)}.result-section h3.green::before{background:var(--green)}
.result-section h3.red{color:var(--red)}.result-section h3.red::before{background:var(--red)}

.domain-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-bottom:8px;transition:border-color .12s}
.domain-card:hover{border-color:var(--border-hover)}
.dc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.dc-domain{font-family:var(--font-mono);font-size:1rem;font-weight:500;color:var(--text);letter-spacing:-.2px}
.dc-tld{display:inline-block;padding:1px 6px;border-radius:4px;background:var(--accent-dim);color:var(--accent);font-size:.6rem;font-weight:600;margin-left:6px;vertical-align:middle;font-family:var(--font-body)}
.dc-right{display:flex;align-items:center;gap:8px}
.dc-badge{padding:3px 10px;border-radius:20px;font-size:.63rem;font-weight:600}
.dc-badge.green{background:var(--green-dim);color:var(--green);border:1px solid rgba(110,231,168,.15)}
.dc-badge.red{background:var(--red-dim);color:var(--red);border:1px solid rgba(252,165,165,.12)}
.dc-reason{color:var(--text-dim);font-size:.8rem;line-height:1.5}
.dc-fav{background:none;border:1px solid var(--border);color:var(--text-muted);padding:2px 10px;border-radius:6px;cursor:pointer;font-size:.66rem;font-family:var(--font-body);transition:all .12s}
.dc-fav:hover{border-color:var(--accent);color:var(--accent)}
.dc-fav.active{border-color:#fbbf24;color:#fbbf24;background:rgba(251,191,36,.07)}
.kw-tag{display:inline-block;padding:2px 9px;border-radius:6px;background:var(--accent-dim);color:var(--accent);font-size:.7rem;margin:2px 4px 10px 0;font-family:var(--font-mono);border:1px solid rgba(167,139,250,.07)}

.status-box{text-align:center;padding:60px 20px}
.status-box p{color:var(--text-dim);margin-top:14px;font-size:.85rem}
.spinner{width:36px;height:36px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .5s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{background:var(--red-dim);border:1px solid rgba(252,165,165,.2);border-radius:10px;padding:14px 18px;text-align:center;color:var(--red);font-size:.85rem}

.auth-wrap{max-width:400px;margin:60px auto;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:36px}
.auth-wrap h2{font-family:var(--font-display);font-size:1.35rem;font-weight:700;margin-bottom:8px;text-align:center;letter-spacing:-.3px}
.form-group{margin-bottom:16px}
.form-group label{display:block;margin-bottom:4px;color:var(--text-dim);font-size:.78rem}
.form-group input{width:100%;padding:11px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:9px;color:var(--text);font-size:.9rem;font-family:var(--font-body);outline:none;transition:border-color .12s}
.form-group input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-dim)}
.btn{display:inline-block;padding:12px 24px;border:none;border-radius:9px;font-family:var(--font-body);font-size:.86rem;font-weight:600;cursor:pointer;transition:all .12s;text-decoration:none;letter-spacing:.2px}
.btn-primary{background:linear-gradient(135deg,var(--accent),#8b5cf6);color:#fff;width:100%}
.btn-primary:hover{filter:brightness(1.06)}
.btn-ghost{background:transparent;color:var(--text-dim);border:1px solid var(--border);padding:7px 16px;font-size:.74rem;font-weight:500;border-radius:7px}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.auth-hint{text-align:center;margin:10px 0 20px;color:var(--text-muted);font-size:.76rem}
.oauth-sep{display:flex;align-items:center;gap:10px;margin:20px 0;color:var(--text-muted);font-size:.7rem}
.oauth-sep::before,.oauth-sep::after{content:'';flex:1;height:1px;background:var(--border)}
.btn-google{width:100%;padding:10px;background:#fff;color:#333;border-radius:9px;font-size:.84rem;font-weight:500;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-google:hover{filter:brightness(.95)}
.btn-google svg{width:18px;height:18px}

.page-title{font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin-bottom:22px;letter-spacing:-.3px}

.profile-wrap{max-width:500px;margin:30px auto}
.profile-header{display:flex;align-items:center;gap:20px;margin-bottom:28px}
.avatar-lg{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-3));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;font-family:var(--font-body);flex-shrink:0}
.avatar-lg-img{width:64px;height:64px;border-radius:50%;object-fit:cover}
.avatar-container{position:relative;cursor:pointer;display:inline-block;flex-shrink:0}
.avatar-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:600;opacity:0;transition:opacity .12s}
.avatar-container:hover .avatar-overlay{opacity:1}
.profile-info h2{font-size:1.25rem;font-weight:600;margin-bottom:2px;display:flex;align-items:center;gap:8px}
.edit-icon{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;align-items:center;transition:color .12s}
.edit-icon:hover{color:var(--accent)}
.profile-info p{color:var(--text-dim);font-size:.8rem}
.profile-edit{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:22px;margin-bottom:18px}
.profile-edit h3{font-size:.95rem;font-weight:600;margin-bottom:14px;color:var(--text)}
.profile-actions{display:flex;gap:8px;margin-top:14px}

.news-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:10px;transition:all .12s}
.news-card:hover{border-color:var(--border-hover)}
.news-card h3{font-family:var(--font-display);font-size:1.05rem;font-weight:600;margin-bottom:4px;letter-spacing:-.2px}
.news-card h3 a{color:var(--text);text-decoration:none}
.news-card h3 a:hover{color:var(--accent)}
.news-card .n-date{color:var(--text-muted);font-size:.68rem}
.news-card .n-summary{color:var(--text-dim);font-size:.82rem;margin-top:6px}
.news-detail h1{font-family:var(--font-display);font-size:1.7rem;font-weight:700;margin-bottom:4px;letter-spacing:-.4px}
.news-detail .nd-meta{color:var(--text-muted);font-size:.74rem;margin-bottom:24px}
.news-detail .nd-body{color:var(--text-dim);line-height:1.8;font-size:.9rem}

.site-footer{text-align:center;padding:16px 24px 24px;color:var(--text-muted);font-size:.62rem;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;opacity:.35}
.site-footer a{color:var(--text-muted);text-decoration:none;transition:color .12s}
.site-footer a:hover{color:var(--accent)}
.site-footer .sep{opacity:.3}

@media(max-width:600px){.hero{padding:50px 0 20px}.hero-title{font-size:1.8rem}.search-bar{flex-direction:column}.search-bar button{border-radius:0 0 13px 13px}.topbar{padding:10px 16px;flex-wrap:wrap;gap:6px}.dc-top{flex-wrap:wrap;gap:6px}.profile-header{flex-direction:column;text-align:center}}
`
