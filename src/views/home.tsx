import type { Lang } from './layout'
import { i18nData } from './layout'

interface HomeProps {
  lang?: Lang
  user?: { id: number; email: string } | null
  favoritedDomains?: string[]
}

function t(lang: Lang, key: string): string {
  return (i18nData as any)[lang]?.[key] || (i18nData as any).en[key] || key
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
  const favSet = JSON.stringify(favoritedDomains)

  return (
    <div>
      <header style="text-align:center; margin-bottom:30px;">
        <h1 style="font-size:2.2rem; font-weight:700; background:linear-gradient(90deg,#00d2ff,#3a7bd5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:6px;">
          Find Good Domain Name
        </h1>
        <p style="color:#888; font-size:0.9rem;">{i18n('subtitle')}</p>
      </header>

      <div class="search-box">
        <div class="input-group">
          <input
            id="keywordInput"
            type="text"
            placeholder={i18n('placeholder')}
            autocomplete="off"
          />
          <button id="submitBtn" class="btn btn-primary">{i18n('generate')}</button>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <span style="color:#666; font-size:0.75rem;">{i18n('examples')}</span>
          {examples.map(ex => (
            <button
              class="btn btn-secondary btn-sm"
              onclick={`setKeywords('${ex[lang === 'zh' ? 'zh' : 'en']}')`}
            >
              {ex[lang === 'zh' ? 'zh' : 'en']}
            </button>
          ))}
        </div>
      </div>

      <div id="resultArea"></div>

      <script>{`
        window._i18n = ${JSON.stringify(i18nData[lang])};
        window._favSet = new Set(${favSet});
        window._userId = ${user ? user.id : 'null'};
        window._currentLang = '${lang}';

        const input = document.getElementById('keywordInput');
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });

        function setKeywords(val) { input.value = val; input.focus(); }

        function t(key) { return window._i18n[key] || key; }

        function escapeHtml(str) {
          if (!str) return '';
          const div = document.createElement('div');
          div.textContent = str;
          return div.innerHTML;
        }

        async function handleSubmit() {
          const raw = input.value.trim();
          if (!raw) return;
          const keywords = raw.split(/[,，\\s]+/).map(k => k.trim()).filter(Boolean);
          if (keywords.length === 0) return;

          const area = document.getElementById('resultArea');
          document.getElementById('submitBtn').disabled = true;
          area.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div><div>' + t('loading') + '</div></div>';

          try {
            const res = await fetch('/api/suggest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keywords, count: 12 }),
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || 'Request failed');
            }
            const data = await res.json();
            renderResults(data);
          } catch(err) {
            area.innerHTML = '<div class="error-msg">' + t('errorPrefix') + ': ' + escapeHtml(err.message) + '</div>';
          } finally {
            document.getElementById('submitBtn').disabled = false;
          }
        }

        function renderResults(data) {
          const { suggestions, registered, keywords } = data;
          let html = '';

          if (keywords && keywords.length > 0) {
            html += '<div style="margin-bottom:16px;">';
            for (const kw of keywords) {
              html += '<span class="keyword-tag">' + escapeHtml(kw) + '</span>';
            }
            html += '</div>';
          }

          if (suggestions && suggestions.length > 0) {
            html += '<h3 class="section-title available">' + t('availableTitle') + '</h3>';
            for (const item of suggestions) {
              html += renderCard(item, 'available');
            }
          }

          if (registered && registered.length > 0) {
            html += '<h3 class="section-title registered">' + t('registeredTitle') + '</h3>';
            for (const item of registered) {
              html += renderCard(item, 'registered');
            }
          }

          if ((!suggestions || suggestions.length === 0) && (!registered || registered.length === 0)) {
            html += '<div style="text-align:center;padding:40px;color:#666;">' + t('emptyResult') + '</div>';
          }

          document.getElementById('resultArea').innerHTML = html;
        }

        function renderCard(item, type) {
          const isFav = window._favSet && window._favSet.has(item.domain.toLowerCase());
          const badge = type === 'available' ? t('availableBadge') : t('registeredBadge');
          let favBtnHtml = '';
          if (type === 'available' && window._userId) {
            favBtnHtml = '<button class="fav-btn' + (isFav ? ' active' : '') + '" onclick="toggleFav(this, \\'' + escapeHtml(item.domain) + '\\', \\'' + escapeHtml(item.reason) + '\\', \\'' + escapeHtml(item.tld) + '\\')">' + (isFav ? '★ ' + t('favorited') : '☆ ' + t('favorite')) + '</button>';
          }
          return '<div class="domain-card">' +
            '<div class="domain-header">' +
              '<div>' +
                '<span class="domain-name">' + escapeHtml(item.domain) + '</span>' +
                '<span class="domain-tld">' + escapeHtml(item.tld) + '</span>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:8px;">' +
                favBtnHtml +
                '<span class="badge badge-' + type + '">' + badge + '</span>' +
              '</div>' +
            '</div>' +
            '<p class="domain-reason">' + escapeHtml(item.reason) + '</p>' +
          '</div>';
        }

        async function toggleFav(btn, domain, reason, tld) {
          const isActive = btn.classList.contains('active');
          const url = isActive ? '/api/favorites/remove' : '/api/favorites/add';
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain, reason, tld }),
            });
            if (res.ok) {
              if (isActive) {
                btn.classList.remove('active');
                btn.textContent = '☆ ' + t('favorite');
                window._favSet.delete(domain.toLowerCase());
              } else {
                btn.classList.add('active');
                btn.textContent = '★ ' + t('favorited');
                window._favSet.add(domain.toLowerCase());
              }
            } else if (res.status === 401) {
              window.location.href = '/login';
            }
          } catch(e) {
            console.error(e);
          }
        }
      `}</script>
    </div>
  )
}
