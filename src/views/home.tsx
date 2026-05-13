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
      <section class="hero-section">
        <div class="pill">AI-Powered Domain Intelligence</div>
        <h1 class="hero-heading">
          <span class="hero-line">Find your next</span>
          <span class="hero-line accent-line">great domain</span>
        </h1>
        <p class="hero-desc">{i18n('subtitle')}</p>
      </section>

      <section class="main-section">
        {/* Mode tabs */}
        <nav class="tabs-row">
          <button class="tab active" data-mode="discover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>{lang === 'zh' ? 'AI 发现域名' : 'AI Discover'}</span>
          </button>
          <button class="tab" data-mode="check">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <span>{lang === 'zh' ? '查询域名状态' : 'Check Domain'}</span>
          </button>
        </nav>

        {/* AI Discover panel */}
        <div class="panel active" id="panelDiscover">
          <div class="search-group">
            <input
              id="keywordInput"
              type="text"
              class="search-input"
              placeholder={i18n('placeholder')}
              autocomplete="off"
              autofocus
            />
            <button id="submitBtn" class="search-btn">
              <span>{i18n('generate')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          <div class="tags-row">
            {examples.map((kw: string) => (
              <button type="button" class="tag" data-kw={kw}>{kw}</button>
            ))}
          </div>
        </div>

        {/* Check panel */}
        <div class="panel" id="panelCheck">
          <div class="search-group">
            <input
              id="domainCheckInput"
              type="text"
              class="search-input"
              placeholder="example.com"
              autocomplete="off"
            />
            <button id="domainCheckBtn" class="search-btn">
              <span>{lang === 'zh' ? '查询' : 'Check'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          <div class="tags-row">
            {['myapp.io', 'coolname.com', 'dash.ai', 'devhub.app'].map(d => (
              <button type="button" class="tag" data-chk={d}>{d}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div id="resultArea"></div>
      </section>

      <script>{raw(`window.__I18N__ = ${safeI18n};window.__FAVS__ = ${safeFavs};window.__UID__ = ${user ? user.id : 'null'};window.__LANG__ = '${lang}';`)}</script>
      <script src="/app.js"></script>
    </div>
  )
}
