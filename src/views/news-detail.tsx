import type { Lang } from './layout'
import { i18nData } from './layout'

interface NewsDetailProps {
  lang?: Lang
  news: { id: number; title: string; slug: string; content: string; summary: string; created_at: string; updated_at: string }
}

function t(lang: Lang, key: string): string {
  return (i18nData as any)[lang]?.[key] || (i18nData as any).en[key] || key
}

export function NewsDetailPage({ lang = 'zh', news }: NewsDetailProps) {
  return (
    <div class="news-detail">
      <h1>{news.title}</h1>
      <div class="meta">{news.created_at}</div>
      <div class="content">{news.content}</div>
      <div style="margin-top:30px;">
        <a href="/news" class="btn btn-secondary btn-sm">{lang === 'zh' ? '← 返回列表' : '← Back to list'}</a>
      </div>
    </div>
  )
}
