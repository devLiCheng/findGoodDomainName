import { t, type Lang } from './i18n'

interface NewsListProps {
  lang?: Lang
  newsItems: Array<{ id: number; title: string; slug: string; summary: string; created_at: string }>
  page: number
  total: number
  limit: number
}

export function NewsListPage({ lang = 'zh', newsItems, page, total, limit }: NewsListProps) {
  const i18n = (key: string) => t(lang, key)
  const totalPages = Math.ceil(total / limit)

  return (
    <div class="wrapper">
      <h2 class="page-title">{i18n('newsTitle')}</h2>
      {newsItems.length === 0 ? (
        <div class="status-box"><p>{i18n('noNews')}</p></div>
      ) : (
        newsItems.map(item => (
          <div class="news-card">
            <h3><a href={`/news/${item.slug}`}>{item.title}</a></h3>
            <div class="n-date">{item.created_at}</div>
            {item.summary && <div class="n-summary">{item.summary}</div>}
          </div>
        ))
      )}
      {totalPages > 1 && (
        <div style="text-align:center; margin-top:24px; display:flex; gap:8px; justify-content:center;">
          {page > 1 && <a href={`/news?page=${page - 1}`} class="btn-ghost">{i18n('prev')}</a>}
          <span style="color:var(--text-muted); font-size:0.82rem; padding:8px 12px;">{page} / {totalPages}</span>
          {page < totalPages && <a href={`/news?page=${page + 1}`} class="btn-ghost">{i18n('next')}</a>}
        </div>
      )}
    </div>
  )
}
