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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{css}</style>
      </head>
      <body>
        <header class="nav">
          <a href="/" class="logo">Find<span class="logo-accent">Good</span>Domain</a>
          <div class="nav-end">
            {user ? (
              <>
                <a href="/profile" class="avatar-link" title={user.nickname || user.email}>
                  {user.avatar
                    ? <img class="avatar-nav" src={user.avatar} alt="" />
                    : <span class="avatar-nav-fallback">{initial}</span>
                  }
                </a>
                <a href="/logout" class="nav-subtle">{i18n('logout')}</a>
              </>
            ) : (
              <a href="/login" class="nav-signin">{i18n('signin')}</a>
            )}
            <a href={`?lang=${nextLang}`} class="lang-btn">{nextLang.toUpperCase()}</a>
          </div>
        </header>
        {children}
        <footer class="footer">
          <span>{i18n('footer')}</span>
          <span class="footer-dot">·</span>
          <a href="/news">{i18n('news')}</a>
        </footer>
      </body>
    </html>
  )
}

const css = `
:root{
  --bg:#0b1018;--bg2:#111827;--bg3:#1a2332;--surface:#131c2a;
  --border:#1e293b;--border2:#293548;
  --text:#f1f5f9;--text2:#94a3b8;--text3:#475569;
  --accent:#22c55e;--accent2:#10b981;--accent3:#4ade80;
  --accent-bg:rgba(34,197,94,.08);--accent-bg2:rgba(34,197,94,.14);
  --green:#22c55e;--green-bg:rgba(34,197,94,.08);
  --red:#ef4444;--red-bg:rgba(239,68,68,.06);
  --font:'Plus Jakarta Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;
  --font-mono:'SF Mono','Cascadia Code','Consolas','Source Code Pro',monospace;
  --radius:16px;--radius-sm:12px;
}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px}body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

.nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(11,16,24,.78);border-bottom:1px solid rgba(255,255,255,.04)}
.logo{font-size:1.15rem;font-weight:700;color:var(--text);text-decoration:none;letter-spacing:-.3px}
.logo-accent{color:var(--accent)}
.nav-end{display:flex;align-items:center;gap:8px}
.nav-end a{color:var(--text2);text-decoration:none;font-size:.8rem;padding:6px 12px;border-radius:8px;transition:all .15s}
.nav-end a:hover{color:var(--text)}
.nav-signin{background:var(--accent-bg);color:var(--accent)!important;font-weight:500}
.nav-signin:hover{background:var(--accent-bg2)!important}
.nav-subtle{opacity:.5;font-size:.72rem!important}
.lang-btn{font-family:var(--font-mono);font-size:.66rem!important;font-weight:500;border:1px solid var(--border);padding:4px 10px!important}
.avatar-link{padding:2px!important}
.avatar-nav{width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid var(--border2)}
.avatar-nav-fallback{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#059669);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700}

/* Hero */
.hero-section{text-align:center;padding:72px 20px 40px}
.pill{display:inline-block;padding:5px 16px;border-radius:20px;background:var(--accent-bg);color:var(--accent);font-size:.72rem;font-weight:500;letter-spacing:.8px;text-transform:uppercase;margin-bottom:24px;border:1px solid rgba(34,197,94,.15)}
.hero-heading{font-size:clamp(2.2rem,5vw,3.2rem);font-weight:700;line-height:1.2;letter-spacing:-.8px;margin-bottom:16px}
.hero-line{display:block}
.accent-line{color:var(--accent);font-style:italic}
.hero-desc{color:var(--text2);font-size:1rem;max-width:480px;margin:0 auto;font-weight:400;line-height:1.6}

/* Main section */
.main-section{max-width:620px;margin:0 auto;padding:0 20px 80px}

/* Tabs */
.tabs-row{display:flex;justify-content:center;gap:6px;margin-bottom:28px;padding:4px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);width:fit-content;margin-left:auto;margin-right:auto}
.tab{display:flex;align-items:center;gap:7px;padding:10px 20px;border-radius:11px;background:transparent;border:none;color:var(--text2);font-family:var(--font);font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1)}
.tab svg{opacity:.5;transition:opacity .2s}
.tab:hover{color:var(--text)}
.tab.active{background:var(--bg3);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.3)}
.tab.active svg{opacity:1;color:var(--accent)}
.panel{transition:opacity .2s}
.panel.active{display:block!important}

/* Search */
.search-group{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:all .25s}
.search-group:focus-within{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-bg),0 12px 40px rgba(34,197,94,.06)}
.search-input{flex:1;padding:15px 20px;background:transparent;border:none;color:var(--text);font-size:.95rem;font-family:var(--font);outline:none}
.search-input::placeholder{color:var(--text3)}
.search-btn{display:flex;align-items:center;gap:8px;padding:15px 24px;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:#052e16;font-family:var(--font);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.2px}
.search-btn:hover{filter:brightness(1.08)}
.search-btn:disabled{filter:brightness(.55);cursor:not-allowed}
.search-btn svg{transition:transform .2s}
.search-btn:hover svg{transform:translateX(2px)}
.tags-row{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:14px}
.tag{background:transparent;border:1px solid var(--border);color:var(--text2);padding:5px 14px;border-radius:20px;cursor:pointer;font-size:.72rem;font-family:var(--font);transition:all .15s}
.tag:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-bg)}

/* Results */
.results{padding-top:28px;min-height:120px}
.results-section{margin-bottom:40px}
.results-section h3{font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;letter-spacing:-.2px}
.results-section h3::before{content:'';width:5px;height:5px;border-radius:50%;flex-shrink:0}
.results-section h3.green{color:var(--green)}.results-section h3.green::before{background:var(--green)}
.results-section h3.red{color:var(--red)}.results-section h3.red::before{background:var(--red)}
.results-section h3 span.count{font-weight:400;font-size:.78rem;color:var(--text3);margin-left:auto}

.domain-row{display:flex;align-items:center;gap:14px;padding:14px 18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;transition:all .15s}
.domain-row:hover{border-color:var(--border2);background:var(--bg2)}
.domain-row .dr-domain{font-family:var(--font-mono);font-size:.95rem;font-weight:500;color:var(--text);white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}
.domain-row .dr-tld{font-size:.68rem;font-weight:600;color:var(--accent);background:var(--accent-bg);padding:2px 7px;border-radius:4px;white-space:nowrap;letter-spacing:.3px}
.domain-row .dr-reason{flex:1;color:var(--text2);font-size:.8rem;line-height:1.45;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.domain-row .dr-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.dr-badge{font-size:.66rem;font-weight:600;padding:3px 10px;border-radius:12px;letter-spacing:.2px}
.dr-badge.green{background:var(--green-bg);color:var(--green)}
.dr-badge.red{background:var(--red-bg);color:var(--red)}
.dr-fav{background:none;border:1px solid var(--border);color:var(--text3);padding:3px 10px;border-radius:6px;cursor:pointer;font-size:.68rem;font-family:var(--font);transition:all .12s;white-space:nowrap}
.dr-fav:hover{border-color:var(--accent);color:var(--accent)}
.dr-fav.active{border-color:var(--accent);color:var(--accent);background:var(--accent-bg)}

.kw-tags{margin-bottom:14px}
.kw-tag{display:inline-block;padding:3px 10px;border-radius:6px;background:var(--accent-bg);color:var(--accent);font-size:.72rem;font-family:var(--font-mono);margin:0 4px 4px 0;border:1px solid rgba(240,192,96,.1)}

/* Domain check result card */
.check-card{max-width:380px;margin:16px auto 0;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:36px 28px;text-align:center;position:relative;overflow:hidden}
.check-card::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 50% 0%,var(--accent-bg) 0%,transparent 50%);pointer-events:none}
.check-card .cc-icon{font-size:3.2rem;margin-bottom:8px;line-height:1;position:relative;z-index:1}
.check-card .cc-domain{font-family:var(--font-mono);font-size:1.4rem;font-weight:600;color:var(--text);margin-bottom:4px;word-break:break-all;position:relative;z-index:1}
.check-card .cc-status{font-size:.9rem;font-weight:600;margin-bottom:16px;position:relative;z-index:1;text-transform:uppercase;letter-spacing:.8px}
.check-card .cc-meta{display:flex;gap:8px;justify-content:center;position:relative;z-index:1}
.check-card .cc-meta span{padding:5px 14px;border-radius:8px;font-size:.72rem;font-weight:600;letter-spacing:.3px}
.check-card.green{border-color:rgba(34,197,94,.3)}.check-card.green .cc-icon{color:var(--green)}.check-card.green .cc-meta span{background:var(--green-bg);color:var(--green);border:1px solid rgba(34,197,94,.2)}
.check-card.red{border-color:rgba(239,68,68,.25)}.check-card.red .cc-icon{color:var(--red)}.check-card.red .cc-meta span{background:var(--red-bg);color:var(--red);border:1px solid rgba(239,68,68,.15)}

/* Status */
.spinner-wrap{text-align:center;padding:50px 20px}
.spinner{width:34px;height:34px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner-wrap p{color:var(--text3);font-size:.85rem}
.error-msg{background:var(--red-bg);border:1px solid rgba(240,112,112,.18);border-radius:var(--radius-sm);padding:14px 18px;text-align:center;color:var(--red);font-size:.85rem}
.empty-msg{text-align:center;padding:50px 20px;color:var(--text3);font-size:.85rem}
.empty-msg p{margin-top:10px}

/* Auth */
.auth-wrap{max-width:380px;margin:60px auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:36px}
.auth-wrap h2{font-size:1.3rem;font-weight:700;margin-bottom:6px;text-align:center;letter-spacing:-.3px}
.form-group{margin-bottom:15px}
.form-group label{display:block;margin-bottom:5px;color:var(--text2);font-size:.78rem;font-weight:500}
.form-group input{width:100%;padding:12px 15px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;font-family:var(--font);outline:none;transition:all .15s}
.form-group input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 24px;border:none;border-radius:10px;font-family:var(--font);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;text-decoration:none;letter-spacing:.2px}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1208;width:100%}
.btn-primary:hover{filter:brightness(1.06);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border);padding:8px 16px;font-size:.75rem;font-weight:500;border-radius:8px}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.auth-hint{text-align:center;margin:8px 0 20px;color:var(--text3);font-size:.76rem}
.oauth-sep{display:flex;align-items:center;gap:10px;margin:20px 0;color:var(--text3);font-size:.7rem}
.oauth-sep::before,.oauth-sep::after{content:'';flex:1;height:1px;background:var(--border)}
.btn-google{width:100%;padding:10px;background:#fff;color:#333;border-radius:10px;font-size:.84rem;font-weight:500;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-google:hover{filter:brightness(.95)}
.btn-google svg{width:18px;height:18px}

/* Profile */
.page-title{font-size:1.3rem;font-weight:700;margin-bottom:24px;letter-spacing:-.3px}
.profile-wrap{max-width:500px;margin:30px auto}
.profile-header{display:flex;align-items:center;gap:20px;margin-bottom:32px}
.avatar-lg{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#059669);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:700;flex-shrink:0}
.avatar-lg-img{width:68px;height:68px;border-radius:50%;object-fit:cover}
.avatar-container{position:relative;cursor:pointer;display:inline-block;flex-shrink:0}
.avatar-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.64rem;font-weight:600;opacity:0;transition:opacity .15s}
.avatar-container:hover .avatar-overlay{opacity:1}
.profile-info h2{font-size:1.2rem;font-weight:600;margin-bottom:2px;display:flex;align-items:center;gap:8px}
.edit-icon{background:none;border:none;color:var(--text3);cursor:pointer;padding:2px;border-radius:4px;display:inline-flex;align-items:center;transition:color .12s}
.edit-icon:hover{color:var(--accent)}
.profile-info p{color:var(--text2);font-size:.82rem}
.profile-edit{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:22px;margin-bottom:20px}
.profile-edit h3{font-size:.95rem;font-weight:600;margin-bottom:14px}
.profile-actions{display:flex;gap:8px;margin-top:14px}

/* News */
.news-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;margin-bottom:10px;transition:all .12s}
.news-card:hover{border-color:var(--border2)}
.news-card h3{font-size:1rem;font-weight:600;margin-bottom:4px;letter-spacing:-.2px}
.news-card h3 a{color:var(--text);text-decoration:none}
.news-card h3 a:hover{color:var(--accent)}
.news-card .n-date{color:var(--text3);font-size:.7rem}
.news-card .n-summary{color:var(--text2);font-size:.83rem;margin-top:6px}
.news-detail h1{font-size:1.6rem;font-weight:700;margin-bottom:4px;letter-spacing:-.4px}
.news-detail .nd-meta{color:var(--text3);font-size:.74rem;margin-bottom:24px}
.news-detail .nd-body{color:var(--text2);line-height:1.85;font-size:.92rem}

/* Footer */
.footer{text-align:center;padding:20px;color:var(--text3);font-size:.65rem;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;opacity:.4}
.footer a{color:var(--text3);text-decoration:none;transition:color .12s}
.footer a:hover{color:var(--accent)}
.footer-dot{opacity:.3}

@media(max-width:600px){
  .nav{padding:0 16px}
  .hero-section{padding:48px 16px 28px}
  .hero-heading{font-size:1.8rem}
  .search-group{flex-direction:column}
  .search-btn{border-radius:0 0 var(--radius) var(--radius);justify-content:center}
  .domain-row{flex-wrap:wrap;gap:8px}
  .dr-reason{flex:auto;width:100%;white-space:normal}
  .tabs-row{width:100%}
  .tab{padding:8px 14px;font-size:.75rem}
  .profile-header{flex-direction:column;text-align:center}
}
`
