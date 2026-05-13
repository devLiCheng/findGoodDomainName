import { raw } from 'hono/html'
import { t, type Lang, i18nData } from './i18n'

interface HomeProps {
  lang?: Lang
  user?: { id: number; email: string } | null
  favoritedDomains?: string[]
}

const examples = [
  { zh: 'ai, 工具', en: 'ai, tool' },
  { zh: '创业, 创始人', en: 'startup, founder' },
  { zh: '代码, 开发者', en: 'code, developer' },
  { zh: '云, 平台', en: 'cloud, platform' },
  { zh: '路由, 令牌', en: 'router, token' },
]

export function HomePage({ lang = 'zh', user, favoritedDomains = [] }: HomeProps) {
  const i18n = (key: string) => t(lang, key)
  const safeI18n = JSON.stringify(i18nData[lang]).replace(/</g, '\\u003c')
  const safeFavs = JSON.stringify(favoritedDomains).replace(/</g, '\\u003c')

  return (
    <div>
      {/* Hero */}
      <div class="hero">
        <div class="hero-tag">Domain Generator</div>
        <h1 class="hero-title">Find your next <em>great</em> domain</h1>
        <p class="hero-sub">{i18n('subtitle')}</p>
      </div>

      <div class="wrapper">
        {/* Search */}
        <div class="search-wrap">
          <div class="search-bar">
            <input
              id="keywordInput"
              type="text"
              placeholder={i18n('placeholder')}
              autocomplete="off"
              autofocus
            />
            <button id="submitBtn"><span>{i18n('generate')}</span></button>
          </div>
          <div class="examples-row">
            <span class="ex-label">{i18n('examples')}</span>
            {examples.map((ex: any) => (
              <button type="button" data-kw={ex[lang === 'zh' ? 'zh' : 'en']}>
                {ex[lang === 'zh' ? 'zh' : 'en']}
              </button>
            ))}
          </div>
        </div>

        {/* Results container */}
        <div class="results" id="resultArea"></div>
      </div>

      {/* Data injection */}
      <script>{raw(`window.__I18N__ = ${safeI18n};window.__FAVS__ = ${safeFavs};window.__UID__ = ${user ? user.id : 'null'};window.__LANG__ = '${lang}';`)}</script>
      <script src="/app.js"></script>
    </div>
  )
}
