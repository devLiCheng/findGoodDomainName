import { t, type Lang } from './i18n'

interface NewsDetailProps {
  lang?: Lang
  news: { id: number; title: string; slug: string; content: string; summary: string; created_at: string; updated_at: string }
}

export function NewsDetailPage({ lang = 'zh', news }: NewsDetailProps) {
  return (
    <div class="wrapper">
      <div class="news-detail">
        <h1>{news.title}</h1>
        <div class="nd-meta">{news.created_at}</div>
        <div class="nd-body">{news.content}</div>
        <div style="margin-top:32px;">
          <a href="/news" class="btn-ghost">{lang === 'zh' ? '← 返回列表' : '← Back to list'}</a>
        </div>
      </div>
    </div>
  )
}
