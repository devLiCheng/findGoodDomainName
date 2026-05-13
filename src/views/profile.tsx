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
  const displayName = user.nickname || user.email.split('@')[0]!
  const safeI18n = JSON.stringify(i18nData[lang]).replace(/</g, '\\u003c')

  return (
    <div class="wrapper">
      <div class="profile-wrap">
        <div class="profile-header">
          <div class="avatar-container" onclick="document.getElementById('avatarFile').click()">
            {user.avatar ? (
              <img class="avatar-lg-img" src={user.avatar} alt="avatar" id="avatarLarge" />
            ) : (
              <span class="avatar-lg" id="avatarLarge">{initial}</span>
            )}
            <div class="avatar-overlay">Edit</div>
          </div>
          <div class="profile-info">
            <h2>
              <span id="displayName">{displayName}</span>
              <button class="edit-icon" onclick="startEditNickname()" title={i18n('editProfile')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </h2>
            <div id="nicknameEdit" style="display:none;margin-top:8px;">
              <input id="nicknameInput" type="text" value={user.nickname} placeholder={user.email.split('@')[0]!} maxlength={30} style="padding:6px 10px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.85rem;font-family:var(--font-body);outline:none;width:180px;" />
              <button class="btn btn-primary" style="width:auto;padding:6px 14px;font-size:.78rem;margin-left:6px;" onclick="saveNickname()">{i18n('save')}</button>
              <button class="btn-ghost" style="padding:6px 12px;font-size:.76rem;" onclick="cancelEditNickname()">{i18n('cancel')}</button>
            </div>
            <p>{user.email}</p>
          </div>
        </div>

        <input type="file" id="avatarFile" accept="image/*" style="display:none" onchange="handleAvatar(event)" />

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
                <button class="dc-fav active" data-domain={fav.domain} onclick="RF(this)">★ {i18n('favorited')}</button>
              </div>
              <p class="dc-reason">{fav.reason}</p>
            </div>
          ))
        )}
      </div>
      <script>{raw(`window.__I18N__ = ${safeI18n};window.__NICK__ = '${displayName}';`)}</script>
      <script>{raw(`
        var avatarDataUrl = '';
        function startEditNickname(){
          document.getElementById('nicknameEdit').style.display='block';
          document.getElementById('displayName').style.display='none';
          var inp=document.getElementById('nicknameInput');inp.focus();inp.select();
        }
        function cancelEditNickname(){
          document.getElementById('nicknameEdit').style.display='none';
          document.getElementById('displayName').style.display='inline';
        }
        async function saveNickname(){
          var n=document.getElementById('nicknameInput').value.trim();
          try{
            var r=await fetch('/api/auth/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:n})});
            if(r.ok){
              var name=n||window.__NICK__;
              document.getElementById('displayName').textContent=name;
              document.getElementById('nicknameEdit').style.display='none';
              document.getElementById('displayName').style.display='inline';
              // Update avatar initial if needed
              var al=document.getElementById('avatarLarge');
              if(al&&al.tagName==='SPAN')al.textContent=(name[0]||'').toUpperCase();
            }
          }catch(e){}
        }
        async function handleAvatar(e){
          var file=e.target.files[0];
          if(!file||!file.type.startsWith('image/'))return;
          var compressed=await compressImage(file);
          avatarDataUrl=compressed;
          var preview=document.getElementById('avatarLarge');
          if(preview&&preview.tagName==='SPAN'){
            var img=document.createElement('img');img.className='avatar-lg-img';img.src=compressed;img.id='avatarLarge';
            preview.parentNode.replaceChild(img,preview);
          }else if(preview){preview.src=compressed}
          // Upload immediately
          var blob=dataURLtoBlob(compressed);var form=new FormData();form.append('avatar',blob,'avatar.jpg');
          await fetch('/api/auth/avatar',{method:'POST',body:form});
        }
        function compressImage(file){
          return new Promise(function(resolve){
            var reader=new FileReader();reader.onload=function(e){
              var img=new Image();img.onload=function(){
                var canvas=document.createElement('canvas');var maxW=400,maxH=400;var w=img.width,h=img.height;
                if(w>maxW||h>maxH){if(w>h){h=h*maxW/w;w=maxW}else{w=w*maxH/h;h=maxH}}
                canvas.width=w;canvas.height=h;var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
                function tryQuality(q){var d=canvas.toDataURL('image/jpeg',q);if(d.length*0.75<2*1024*1024||q<=0.1){resolve(d)}else{tryQuality(q-0.15)}}
                tryQuality(0.85);
              };img.src=e.target.result;
            };reader.readAsDataURL(file);
          });
        }
        function dataURLtoBlob(d){var a=d.split(','),m=a[0].match(/:(.*?);/)[1],b=atob(a[1]),n=b.length,u=new Uint8Array(n);while(n--){u[n]=b.charCodeAt(n)}return new Blob([u],{type:m})}
        async function RF(btn){var d=btn.getAttribute('data-domain');try{var r=await fetch('/api/favorites/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:d})});if(r.ok)window.location.reload()}catch(e){}}
      `)}</script>
    </div>
  )
}
