import { Hono } from 'hono'
import { getCookie, setCookie as setCk } from 'hono/cookie'
import type { Lang } from './views/i18n'
import { Layout } from './views/layout'
import { HomePage } from './views/home'
import { LoginPage } from './views/login'
import { ProfilePage } from './views/profile'
import { NewsListPage } from './views/news-list'
import { NewsDetailPage } from './views/news-detail'
import { getAuthUser, setAuthCookie, removeAuthCookie, createToken } from './middleware/auth'
import { users, favorites, news } from './services/db'
import domainRoutes from './routes/domain'
import authApiRoutes from './routes/auth'
import favoritesApiRoutes from './routes/favorites'
import newsApiRoutes from './routes/news'

const app = new Hono()

app.route('/api', domainRoutes)
app.route('/api/auth', authApiRoutes)
app.route('/api/favorites', favoritesApiRoutes)
app.route('/api/news', newsApiRoutes)

// Client-side JS
app.get('/app.js', (c) => {
  return c.body(`(function(){
var I=window.__I18N__||{};
var F=new Set(window.__FAVS__||[]);
var U=window.__UID__;
function T(k){return I[k]||k}
function E(s){if(!s)return'';var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var input=document.getElementById('keywordInput');
var btn=document.getElementById('submitBtn');
var dcInput=document.getElementById('domainCheckInput');
var dcBtn=document.getElementById('domainCheckBtn');
var loading=false;
var discoverHTML='',checkHTML='';

function setButtons(d){loading=d;if(btn)btn.disabled=d;if(dcBtn)dcBtn.disabled=d}

// Enter key and click handlers
if(input){input.addEventListener('keydown',function(e){if(e.key==='Enter')HS()});if(btn)btn.addEventListener('click',HS)}
if(dcInput)dcInput.addEventListener('keydown',function(e){if(e.key==='Enter')checkDomain()})
if(dcBtn)dcBtn.addEventListener('click',checkDomain)

// Example tags
document.querySelectorAll('#panelDiscover .tag').forEach(function(b){
  b.addEventListener('click',function(){input.value=this.getAttribute('data-kw');input.focus()})
});
// Check hints
document.querySelectorAll('#panelCheck .tag').forEach(function(b){
  b.addEventListener('click',function(){dcInput.value=this.getAttribute('data-chk');checkDomain()})
});

// Tab switching - don't clear results, only toggle panels
document.querySelectorAll('.tab').forEach(function(t){
  t.addEventListener('click',function(){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active')});
    this.classList.add('active');
    var mode=this.getAttribute('data-mode');
    document.getElementById('panelDiscover').style.display=mode==='discover'?'block':'none';
    document.getElementById('panelCheck').style.display=mode==='check'?'block':'none';
    if(mode==='discover')input.focus();else dcInput.focus()
  });
});

function renderAll(){
  var h=discoverHTML+checkHTML;
  if(!h)h='<div class="empty-msg"><p>'+T('emptyResult')+'</p></div>';
  document.getElementById('resultArea').innerHTML=h
}

async function HS(){
  if(!U||U==='null'){window.location.href='/login?redirect='+encodeURIComponent(window.location.href);return}
  var raw=input.value.trim();if(!raw||loading)return;
  var kw=raw.split(/[,,\\\\s]+/).map(function(k){return k.trim()}).filter(Boolean);
  if(kw.length===0)return;setButtons(true);
  discoverHTML='<div class="spinner-wrap"><div class="spinner"></div><p>'+T('loading')+'</p></div>';renderAll();
  try{
    var res=await fetch('/api/suggest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({keywords:kw,count:12})});
    if(!res.ok){var ed=await res.json().catch(function(){return{}});throw new Error(ed.error||'Request failed')}
    var data=await res.json();buildDiscover(data)
  }catch(err){discoverHTML='<div class="error-msg">'+T('errorPrefix')+': '+E(err.message)+'</div>'}
  finally{setButtons(false);renderAll()}
}
function buildDiscover(data){
  var s=data.suggestions,r=data.registered,kw=data.keywords,h='';
  if(kw&&kw.length){h+='<div class="kw-tags">';for(var i=0;i<kw.length;i++)h+='<span class="kw-tag">'+E(kw[i])+'</span>';h+='</div>'}
  if(s&&s.length){h+='<div class="results-section"><h3 class="green">'+T('availableTitle')+'<span class="count">'+s.length+'</span></h3>';for(var j=0;j<s.length;j++)h+=RC(s[j],'available');h+='</div>'}
  if(r&&r.length){h+='<div class="results-section"><h3 class="red">'+T('registeredTitle')+'<span class="count">'+r.length+'</span></h3>';for(var k=0;k<r.length;k++)h+=RC(r[k],'registered');h+='</div>'}
  discoverHTML=h
}

async function checkDomain(){
  if(!U||U==='null'){window.location.href='/login?redirect='+encodeURIComponent(window.location.href);return}
  var domain=dcInput.value.trim().toLowerCase();if(!domain||loading)return;setButtons(true);
  checkHTML='<div class="spinner-wrap"><div class="spinner"></div><p>'+T('loading')+'</p></div>';renderAll();
  try{
    var r=await fetch('/api/check?domain='+encodeURIComponent(domain));
    var d=await r.json();buildCheck(d)
  }catch(e){checkHTML='<div class="error-msg">'+T('errorPrefix')+': '+E(e.message)+'</div>'}
  finally{setButtons(false);renderAll()}
}
function buildCheck(d){
  var tld=d.domain.split('.').pop(),cls=d.available?'green':'red',icon=d.available?'&#10003;':'&#10007;',status=d.available?T('availableBadge'):T('registeredBadge');
  checkHTML='<div class="check-card '+cls+'"><div class="cc-icon">'+icon+'</div><div class="cc-domain">'+E(d.domain)+'</div><div class="cc-status" style="color:var(--'+cls+')">'+status+'</div><div class="cc-meta"><span>.'+tld+'</span></div></div>'
}

function RC(item,type){
  var isFav=F.has(item.domain.toLowerCase()),favHtml='';
  if(type==='available'&&U&&U!=='null')favHtml='<button class="dr-fav'+(isFav?' active':'')+'" data-domain="'+E(item.domain)+'" data-reason="'+E(item.reason||'')+'" data-tld="'+E(item.tld||'')+'">'+(isFav?'\\u2605':'\\u2606')+'</button>'
  return '<div class="domain-row"><span class="dr-domain">'+E(item.domain)+'</span><span class="dr-tld">'+E(item.tld||'')+'</span><span class="dr-reason">'+E(item.reason||'')+'</span><div class="dr-right">'+favHtml+'<span class="dr-badge '+(type==='available'?'green':'red')+'">'+(type==='available'?T('availableBadge'):T('registeredBadge'))+'</span></div></div>'
}
async function TF(btn){
  var isActive=btn.classList.contains('active'),domain=btn.getAttribute('data-domain')||'',reason=btn.getAttribute('data-reason')||'',tld=btn.getAttribute('data-tld')||'';
  var url=isActive?'/api/favorites/remove':'/api/favorites/add';
  try{
    var res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:domain,reason:reason,tld:tld})});
    if(res.ok){if(isActive){btn.classList.remove('active');btn.textContent='\\u2606';F.delete(domain.toLowerCase())}else{btn.classList.add('active');btn.textContent='\\u2605';F.add(domain.toLowerCase())}}
    else if(res.status===401)window.location.href='/login'
  }catch(e){}
}
document.addEventListener('click',function(e){var btn=e.target.closest('.dr-fav');if(btn)TF(btn)});
})();`, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
})

function getLang(c: any): Lang {
  const qLang = c.req.query('lang') as Lang | undefined
  if (qLang === 'zh' || qLang === 'en') {
    setCk(c, 'lang', qLang, { maxAge: 365 * 24 * 60 * 60, path: '/' })
    return qLang
  }
  const ckLang = getCookie(c, 'lang') as Lang | undefined
  if (ckLang === 'zh' || ckLang === 'en') return ckLang
  const al = c.req.header('Accept-Language') || ''
  return al.startsWith('zh') ? 'zh' : 'zh'
}

// Home
app.get('/', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  let favoritedDomains: string[] = []
  if (user) favoritedDomains = Array.from(favorites.getFavoritedDomains(user.id))
  return c.html(
    <Layout user={user} lang={lang}>
      <HomePage lang={lang} user={user} favoritedDomains={favoritedDomains} />
    </Layout>
  )
})

// Login page
app.get('/login', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (user) return c.redirect('/')
  const error = c.req.query('error') || undefined
  const redirect = c.req.query('redirect') || '/'
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  return c.html(
    <Layout lang={lang}>
      <LoginPage lang={lang} error={error} redirect={redirect} googleClientId={googleClientId} />
    </Layout>
  )
})

// Login POST - unified: existing user = login, new user = auto-register
app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')
  const redirect = String(body.redirect || '/')

  if (!email || !password) {
    return c.redirect(`/login?error=${encodeURIComponent('Please fill in email and password')}&redirect=${encodeURIComponent(redirect)}`)
  }
  if (password.length < 6) {
    return c.redirect(`/login?error=${encodeURIComponent('Password must be at least 6 characters')}&redirect=${encodeURIComponent(redirect)}`)
  }

  let user = users.findByEmail(email)

  if (user) {
    const valid = await Bun.password.verify(password, user.password_hash)
    if (!valid) {
      return c.redirect(`/login?error=${encodeURIComponent('Invalid email or password')}&redirect=${encodeURIComponent(redirect)}`)
    }
  } else {
    const passwordHash = await Bun.password.hash(password)
    users.create(email, passwordHash)
    user = users.findByEmail(email)
    if (!user) {
      return c.redirect(`/login?error=${encodeURIComponent('Registration failed')}&redirect=${encodeURIComponent(redirect)}`)
    }
  }

  const token = await createToken({ id: user.id, email: user.email, nickname: user.nickname || '', avatar: user.avatar || '' })
  setAuthCookie(c, token)
  return c.redirect(redirect)
})

// Remove old register route - redirect to unified login
app.get('/register', (c) => c.redirect('/login'))

// Logout
app.get('/logout', (c) => {
  removeAuthCookie(c)
  return c.redirect('/')
})

// Profile page
app.get('/profile', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login?redirect=' + encodeURIComponent('/profile'))

  const favs = favorites.listByUser(user.id)
  return c.html(
    <Layout user={user} lang={lang}>
      <ProfilePage lang={lang} user={user} favorites={favs} />
    </Layout>
  )
})

// News - SSR with 5-minute HTTP cache for high concurrency
app.get('/news', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const page = parseInt(c.req.query('page') || '1')
  const data = news.list(page, 10)

  c.header('Cache-Control', 'public, max-age=300, s-maxage=600')
  return c.html(
    <Layout user={user} lang={lang} title="News">
      <NewsListPage lang={lang} newsItems={data.items} page={data.page} total={data.total} limit={data.limit} />
    </Layout>
  )
})

app.get('/news/:slug', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const slug = c.req.param('slug')
  const article = news.findBySlug(slug)
  if (!article) return c.notFound()

  c.header('Cache-Control', 'public, max-age=300, s-maxage=600')
  return c.html(
    <Layout user={user} lang={lang} title={article.title}>
      <NewsDetailPage lang={lang} news={article} />
    </Layout>
  )
})

export default app
