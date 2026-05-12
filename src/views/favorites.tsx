import type { Lang } from './layout'
import { i18nData } from './layout'

interface FavoritesProps {
  lang?: Lang
  favorites: Array<{ id: number; domain: string; reason: string; tld: string; created_at: string }>
}

function t(lang: Lang, key: string): string {
  return (i18nData as any)[lang]?.[key] || (i18nData as any).en[key] || key
}

export function FavoritesPage({ lang = 'zh', favorites }: FavoritesProps) {
  const i18n = (key: string) => t(lang, key)

  return (
    <div>
      <h2 style="color:#fff; margin-bottom:20px;">{i18n('myFavorites')}</h2>
      {favorites.length === 0 ? (
        <div style="text-align:center;padding:40px;color:#666;">{i18n('noFavorites')}</div>
      ) : (
        favorites.map(fav => (
          <div class="domain-card">
            <div class="domain-header">
              <div>
                <span class="domain-name">{fav.domain}</span>
                <span class="domain-tld">{fav.tld}</span>
              </div>
              <button
                class="fav-btn active"
                onclick={`removeFav('${fav.domain}')`}
                style="margin-left:auto;"
              >
                ★ {i18n('favorited')}
              </button>
            </div>
            <p class="domain-reason">{fav.reason}</p>
          </div>
        ))
      )}
      <script>{`
        async function removeFav(domain) {
          try {
            const res = await fetch('/api/favorites/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain }),
            });
            if (res.ok) { window.location.reload(); }
          } catch(e) {}
        }
      `}</script>
    </div>
  )
}
