import { t, type Lang } from './i18n'

interface FavoritesProps {
  lang?: Lang
  favorites: Array<{ id: number; domain: string; reason: string; tld: string; created_at: string }>
}

export function FavoritesPage({ lang = 'zh', favorites }: FavoritesProps) {
  const i18n = (key: string) => t(lang, key)

  return (
    <div class="wrapper">
      <h2 class="page-title">{i18n('myFavorites')}</h2>
      {favorites.length === 0 ? (
        <div class="status-box"><p>{i18n('noFavorites')}</p></div>
      ) : (
        favorites.map(fav => (
          <div class="domain-card">
            <div class="dc-top">
              <div>
                <span class="dc-domain">{fav.domain}</span>
                <span class="dc-tld">{fav.tld}</span>
              </div>
              <button
                class="dc-fav active"
                onclick={`RF('${fav.domain}')`}
              >
                ★ {i18n('favorited')}
              </button>
            </div>
            <p class="dc-reason">{fav.reason}</p>
          </div>
        ))
      )}
      <script>{`async function RF(d){try{var r=await fetch('/api/favorites/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:d})});if(r.ok)window.location.reload()}catch(e){}}`}</script>
    </div>
  )
}
