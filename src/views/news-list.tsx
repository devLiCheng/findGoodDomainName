import type { Lang } from './layout'
import { i18nData } from './layout'

interface NewsListProps {
  lang?: Lang
  newsItems: Array<{ id: number; title: string; slug: string; summary: string; created_at: string }>
  page: number
  total: number
  limit: number
}

function t(lang: Lang, key: string): string {
  return (i18nData as any)[lang]?.[key] || (i18nData as any).en[key] || key
}

export function NewsListPage({ lang = 'zh', newsItems, page, total, limit }: NewsListProps) {
  const i18n = (key: string) => t(lang, key)
  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <h2 style="color:#fff; margin-bottom:20px;">{i18n('newsTitle')}</h2>
      {newsItems.length === 0 ? (
        <div style="text-align:center;padding:40px;color:#666;">{i18n('noNews')}</div>
      ) : (
        newsItems.map(item => (
          <div class="news-card">
            <h3><a href={`/news/${item.slug}`}>{item.title}</a></h3>
            <div class="news-date">{item.created_at}</div>
            {item.summary && <div class="news-summary">{item.summary}</div>}
          </div>
        ))
      )}
      {totalPages > 1 && (
        <div style="text-align:center; margin-top:20px; display:flex; gap:8px; justify-content:center;">
          {page > 1 && <a href={`/news?page=${page - 1}`} class="btn btn-secondary btn-sm">{i18n('prev')}</a>}
          <span style="color:#888; font-size:0.85rem; padding:6px;">{page} / {totalPages}</span>
          {page < totalPages && <a href={`/news?page=${page + 1}`} class="btn btn-secondary btn-sm">{i18n('next')}</a>}
        </div>
      )}
    </div>
  )
}
