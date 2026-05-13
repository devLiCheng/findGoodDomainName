import { raw } from 'hono/html'
import { t, type Lang, i18nData } from './i18n'

interface ProfileProps {
  lang?: Lang
  user: { id: number; email: string; nickname: string; avatar: string }
  favorites: Array<{ id: number; domain: string; reason: string; tld: string; created_at: string }>
}

export function ProfilePage({ lang = 'zh', user, favorites }: ProfileProps) {
  const i18n = (key: string) => t(lang, key)
  const initial = (user.nickname || user.email)[0]!.toUpperCase()
  const safeI18n = JSON.stringify(i18nData[lang]).replace(/</g, '\\u003c')

  return (
    <div class="wrapper">
      <div class="profile-wrap">
        <div class="profile-header">
          <span class="avatar-lg" id="avatarLarge">{initial}</span>
          <div class="profile-info">
            <h2 id="displayName">{user.nickname || user.email.split('@')[0]}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div class="profile-edit">
          <h3>{i18n('editProfile')}</h3>
          <div class="form-group">
            <label>{i18n('nickname')}</label>
            <input id="nicknameInput" type="text" value={user.nickname} placeholder={user.email.split('@')[0]!} maxlength={30} />
          </div>
          <div class="profile-actions">
            <button class="btn btn-primary" style="width:auto;padding:10px 24px;" onclick="saveProfile()">{i18n('save')}</button>
            <button class="btn-ghost" onclick="window.location.reload()">{i18n('cancel')}</button>
          </div>
          <div id="profileMsg" style="margin-top:12px;font-size:.82rem;"></div>
        </div>

        <h3 class="page-title" style="font-size:1.2rem;">{i18n('myFavorites')}</h3>
        {favorites.length === 0 ? (
          <div class="status-box" style="padding:40px 20px;"><p>{i18n('noFavorites')}</p></div>
        ) : (
          favorites.map(fav => (
            <div class="domain-card">
              <div class="dc-top">
                <div>
                  <span class="dc-domain">{fav.domain}</span>
                  <span class="dc-tld">{fav.tld}</span>
                </div>
                <button class="dc-fav active" onclick={`RF('${fav.domain}')`}>★ {i18n('favorited')}</button>
              </div>
              <p class="dc-reason">{fav.reason}</p>
            </div>
          ))
        )}
      </div>
      <script>{raw(`window.__I18N__ = ${safeI18n};`)}</script>
      <script>{raw(`
        async function saveProfile(){
          var n=document.getElementById('nicknameInput').value.trim();
          var m=document.getElementById('profileMsg');
          try{
            var r=await fetch('/api/auth/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:n})});
            var d=await r.json();
            if(r.ok){m.style.color='var(--green)';m.textContent='Saved!';document.getElementById('displayName').textContent=n||'` + (user.email.split('@')[0]!) + `';document.getElementById('avatarLarge').textContent=(n||'` + (user.email[0]!) + `')[0].toUpperCase();setTimeout(function(){m.textContent=''},2000)}
            else{m.style.color='var(--red)';m.textContent=d.error||'Failed'}
          }catch(e){m.style.color='var(--red)';m.textContent='Network error'}
        }
        async function RF(d){try{var r=await fetch('/api/favorites/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:d})});if(r.ok)window.location.reload()}catch(e){}}
      `)}</script>
    </div>
  )
}
