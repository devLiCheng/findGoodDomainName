import { raw } from 'hono/html'
import { t, type Lang, i18nData } from './i18n'

interface HomeProps {
  lang?: Lang
  user?: { id: number; email: string; nickname: string; avatar: string } | null
  favoritedDomains?: string[]
}

const examples = ['ai, tool', 'startup, founder', 'code, developer', 'cloud, platform', 'router, token']

export function HomePage({ lang = 'zh', user, favoritedDomains = [] }: HomeProps) {
  const i18n = (key: string) => t(lang, key)
  const safeI18n = JSON.stringify(i18nData[lang]).replace(/</g, '\\u003c')
  const safeFavs = JSON.stringify(favoritedDomains).replace(/</g, '\\u003c')

  return (
    <div>
      <div class="hero">
        <div class="hero-tag">Domain Generator</div>
        <h1 class="hero-title">Find your next <em>great</em> domain</h1>
        <p class="hero-sub">{i18n('subtitle')}</p>
      </div>

      <div class="wrapper">
        {/* Tab switcher */}
        <div class="mode-tabs">
          <button class="mode-tab active" data-mode="discover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>{lang === 'zh' ? 'AI 发现' : 'AI Discover'}</span>
          </button>
          <button class="mode-tab" data-mode="check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span>{lang === 'zh' ? '查询域名' : 'Check Domain'}</span>
          </button>
        </div>

        {/* Panel: AI Discovery */}
        <div class="mode-panel active" id="panelDiscover">
          <div class="search-wrap">
            <div class="search-bar">
              <input id="keywordInput" type="text" placeholder={i18n('placeholder')} autocomplete="off" autofocus />
              <button id="submitBtn">{i18n('generate')}</button>
            </div>
            <div class="examples-row">
              <span class="ex-label">{i18n('examples')}</span>
              {examples.map((kw: string) => (
                <button type="button" data-kw={kw}>{kw}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel: Check Domain */}
        <div class="mode-panel" id="panelCheck" style="display:none">
          <div class="search-wrap">
            <div class="search-bar">
              <input id="domainCheckInput" type="text" placeholder="example.com" autocomplete="off" />
              <button id="domainCheckBtn">{lang === 'zh' ? '查询' : 'Check'}</button>
            </div>
            <div class="check-hints" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
              <span style="color:var(--text-muted);font-size:.65rem;padding:3px 0;">{lang === 'zh' ? '试试:' : 'Try:'}</span>
              {['myapp.io', 'coolname.com', 'dash.ai', 'devhub.app'].map(d => (
                <button type="button" data-chk={d} style="background:transparent;border:1px solid var(--border);color:var(--text-dim);padding:2px 10px;border-radius:12px;cursor:pointer;font-size:.66rem;font-family:var(--font-body);transition:all .12s;">{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Shared results area */}
        <div class="results" id="resultArea"></div>
      </div>

      <script>{raw(`window.__I18N__ = ${safeI18n};window.__FAVS__ = ${safeFavs};window.__UID__ = ${user ? user.id : 'null'};window.__LANG__ = '${lang}';`)}</script>
      <script src="/app.js"></script>
    </div>
  )
}
