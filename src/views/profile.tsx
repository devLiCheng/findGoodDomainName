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
          <div class="avatar-container" onclick="document.getElementById('avatarFile').click()">
            {user.avatar ? (
              <img class="avatar-lg-img" src={user.avatar} alt="avatar" />
            ) : (
              <span class="avatar-lg" id="avatarLarge">{initial}</span>
            )}
            <div class="avatar-overlay">Edit</div>
          </div>
          <div class="profile-info">
            <h2 id="displayName">{user.nickname || user.email.split('@')[0]}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <input type="file" id="avatarFile" accept="image/*" style="display:none" onchange="handleAvatar(event)" />

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
        var avatarDataUrl = '';

        async function handleAvatar(e){
          var file = e.target.files[0];
          if(!file)return;
          if(!file.type.startsWith('image/')){alert('Please select an image');return}

          // Client-side compression to < 2MB
          var compressed = await compressImage(file);
          avatarDataUrl = compressed;

          // Preview
          var preview = document.getElementById('avatarLarge');
          if(preview && preview.tagName==='SPAN'){
            var img = document.createElement('img');
            img.className = 'avatar-lg-img';
            img.src = compressed;
            img.id = 'avatarLarge';
            preview.parentNode.replaceChild(img, preview);
          } else if(preview){
            preview.src = compressed;
          }
        }

        function compressImage(file){
          return new Promise(function(resolve, reject){
            var reader = new FileReader();
            reader.onload = function(e){
              var img = new Image();
              img.onload = function(){
                var canvas = document.createElement('canvas');
                var maxW = 400, maxH = 400;
                var w = img.width, h = img.height;
                if(w > maxW || h > maxH){
                  if(w > h){h = h * maxW / w; w = maxW}
                  else{w = w * maxH / h; h = maxH}
                }
                canvas.width = w; canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                // Try compressing with decreasing quality until < 2MB
                function tryQuality(q){
                  var dataUrl = canvas.toDataURL('image/jpeg', q);
                  var byteLen = dataUrl.length * 0.75; // base64 * 0.75 ≈ bytes
                  if(byteLen < 2 * 1024 * 1024 || q <= 0.1){
                    resolve(dataUrl);
                  } else {
                    tryQuality(q - 0.15);
                  }
                }
                tryQuality(0.85);
              };
              img.src = e.target.result;
            };
            reader.readAsDataURL(file);
          });
        }

        async function saveProfile(){
          var n = document.getElementById('nicknameInput').value.trim();
          var m = document.getElementById('profileMsg');
          try{
            // Update nickname
            var r1 = await fetch('/api/auth/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:n})});
            var d1 = await r1.json();
            if(!r1.ok){m.style.color='var(--red)';m.textContent=d1.error||'Failed';return}

            // Upload avatar if changed
            if(avatarDataUrl){
              var blob = dataURLtoBlob(avatarDataUrl);
              var form = new FormData();
              form.append('avatar', blob, 'avatar.jpg');
              var r2 = await fetch('/api/auth/avatar',{method:'POST',body:form});
              var d2 = await r2.json();
              if(!r2.ok){m.style.color='var(--red)';m.textContent=d2.error||'Upload failed';return}
            }

            m.style.color='var(--green)';m.textContent='Saved!';
            var disp = document.getElementById('displayName');
            if(disp)disp.textContent=n||'` + (user.email.split('@')[0]!) + `';
            setTimeout(function(){m.textContent=''},2000);
          }catch(e){m.style.color='var(--red)';m.textContent='Network error'}
        }

        function dataURLtoBlob(dataurl){
          var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
          var bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while(n--){u8arr[n] = bstr.charCodeAt(n)}
          return new Blob([u8arr], {type:mime});
        }

        async function RF(d){try{var r=await fetch('/api/favorites/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:d})});if(r.ok)window.location.reload()}catch(e){}}
      `)}</script>
    </div>
  )
}
