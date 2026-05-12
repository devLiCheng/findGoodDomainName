import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { t, type Lang } from './views/i18n'
import { Layout } from './views/layout'
import { HomePage } from './views/home'
import { LoginPage } from './views/login'
import { FavoritesPage } from './views/favorites'
import { NewsListPage } from './views/news-list'
import { NewsDetailPage } from './views/news-detail'
import { getAuthUser, setAuthCookie, removeAuthCookie, createToken } from './middleware/auth'
import { users, favorites, news } from './services/db'
import domainRoutes from './routes/domain'
import authApiRoutes from './routes/auth'
import favoritesApiRoutes from './routes/favorites'
import newsApiRoutes from './routes/news'

const app = new Hono()

// API routes
app.route('/api', domainRoutes)
app.route('/api/auth', authApiRoutes)
app.route('/api/favorites', favoritesApiRoutes)
app.route('/api/news', newsApiRoutes)

// Client-side JS (served as static asset to avoid JSX escaping issues)
app.get('/app.js', (c) => {
  return c.body(`(function(){
var I=window.__I18N__||{};
var F=new Set(window.__FAVS__||[]);
var U=window.__UID__;
function T(k){return I[k]||k}
function E(s){if(!s)return'';var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var input=document.getElementById('keywordInput');
var btn=document.getElementById('submitBtn');
if(input){
  input.addEventListener('keydown',function(e){if(e.key==='Enter')HS()});
  document.querySelectorAll('.examples-row button[data-kw]').forEach(function(b){
    b.addEventListener('click',function(){input.value=this.getAttribute('data-kw');input.focus()})
  });
}

async function HS(){
  var raw=input.value.trim();if(!raw)return;
  var kw=raw.split(/[,,\\\\s]+/).map(function(k){return k.trim()}).filter(Boolean);
  if(kw.length===0)return;
  var area=document.getElementById('resultArea');
  btn.disabled=true;
  area.innerHTML='<div class="status-box"><div class="spinner"></div><p>'+T('loading')+'</p></div>';
  try{
    var res=await fetch('/api/suggest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({keywords:kw,count:12})});
    if(!res.ok){var ed=await res.json().catch(function(){return{}});throw new Error(ed.error||'Request failed')}
    var data=await res.json();RR(data)
  }catch(err){
    area.innerHTML='<div class="error-box">'+T('errorPrefix')+': '+E(err.message)+'</div>'
  }finally{btn.disabled=false}
}

function RR(data){
  var s=data.suggestions,r=data.registered,kw=data.keywords;
  var h='';
  if(kw&&kw.length){h+='<div>';for(var i=0;i<kw.length;i++)h+='<span class="kw-tag">'+E(kw[i])+'</span>';h+='</div>'}
  if(s&&s.length){h+='<div class="result-section"><h3 class="green">'+T('availableTitle')+'</h3>';for(var j=0;j<s.length;j++)h+=RC(s[j],'available');h+='</div>'}
  if(r&&r.length){h+='<div class="result-section"><h3 class="red">'+T('registeredTitle')+'</h3>';for(var k=0;k<r.length;k++)h+=RC(r[k],'registered');h+='</div>'}
  if((!s||!s.length)&&(!r||!r.length))h='<div class="status-box"><p>'+T('emptyResult')+'</p></div>';
  document.getElementById('resultArea').innerHTML=h
}

function RC(item,type){
  var d=item.domain.toLowerCase();
  var isFav=F.has(d);
  var favHtml='';
  if(type==='available'&&U){
    favHtml='<button class="dc-fav'+(isFav?' active':'')+'" onclick="TF(this,\\''+E(item.domain)+'\\',\\''+E(item.reason||'')+'\\',\\''+E(item.tld||'')+'\\')">'+(isFav?'\\\\u2605 '+T('favorited'):'\\\\u2606 '+T('favorite'))+'</button>'
  }
  return '<div class="domain-card"><div class="dc-top"><div><span class="dc-domain">'+E(item.domain)+'</span><span class="dc-tld">'+E(item.tld||'')+'</span></div><div class="dc-right">'+favHtml+'<span class="dc-badge '+(type==='available'?'green':'red')+'">'+(type==='available'?T('availableBadge'):T('registeredBadge'))+'</span></div></div><p class="dc-reason">'+E(item.reason||'')+'</p></div>'
}

async function TF(btn,domain,reason,tld){
  var isActive=btn.classList.contains('active');
  var url=isActive?'/api/favorites/remove':'/api/favorites/add';
  try{
    var res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:domain,reason:reason,tld:tld})});
    if(res.ok){
      if(isActive){btn.classList.remove('active');btn.textContent='\\\\u2606 '+T('favorite');F.delete(domain.toLowerCase())}
      else{btn.classList.add('active');btn.textContent='\\\\u2605 '+T('favorited');F.add(domain.toLowerCase())}
    }else if(res.status===401){window.location.href='/login'}
  }catch(e){}
}
window.HS=HS;window.TF=TF;
})();`, 200, { 'Content-Type': 'application/javascript; charset=utf-8' })
})

// Get language from query param or cookie
function getLang(c: any): Lang {
  const qLang = c.req.query('lang') as Lang | undefined
  if (qLang === 'zh' || qLang === 'en') return qLang
  const ckLang = getCookie(c, 'lang') as Lang | undefined
  if (ckLang === 'zh' || ckLang === 'en') return ckLang
  const al = c.req.header('Accept-Language') || ''
  if (al.startsWith('zh')) return 'zh'
  return 'zh'
}

// Home page (SSR)
app.get('/', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  let favoritedDomains: string[] = []
  if (user) {
    favoritedDomains = Array.from(favorites.getFavoritedDomains(user.id))
  }
  return c.html(
    <Layout user={user} lang={lang} currentUrl="/">
      <HomePage lang={lang} user={user} favoritedDomains={favoritedDomains} />
    </Layout>
  )
})

// Login page (SSR)
app.get('/login', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (user) return c.redirect('/')
  const error = c.req.query('error') || undefined
  const redirect = c.req.query('redirect') || '/'
  return c.html(
    <Layout lang={lang}>
      <LoginPage lang={lang} error={error} redirect={redirect} mode="login" />
    </Layout>
  )
})

app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')
  const redirect = String(body.redirect || '/')

  if (!email || !password) {
    return c.redirect(`/login?error=${encodeURIComponent('请填写邮箱和密码')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const user = users.findByEmail(email)
  if (!user) {
    return c.redirect(`/login?error=${encodeURIComponent('邮箱或密码错误')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const valid = await Bun.password.verify(password, user.password_hash)
  if (!valid) {
    return c.redirect(`/login?error=${encodeURIComponent('邮箱或密码错误')}&redirect=${encodeURIComponent(redirect)}`)
  }

  const token = await createToken({ id: user.id, email: user.email })
  setAuthCookie(c, token)
  return c.redirect(redirect)
})

app.get('/register', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (user) return c.redirect('/')
  const error = c.req.query('error') || undefined
  return c.html(
    <Layout lang={lang}>
      <LoginPage lang={lang} error={error} mode="register" />
    </Layout>
  )
})

app.post('/register', async (c) => {
  const body = await c.req.parseBody()
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')

  if (!email || !password) {
    return c.redirect('/register?error=' + encodeURIComponent('请填写邮箱和密码'))
  }
  if (password.length < 6) {
    return c.redirect('/register?error=' + encodeURIComponent('密码至少6位'))
  }

  const existing = users.findByEmail(email)
  if (existing) {
    return c.redirect('/register?error=' + encodeURIComponent('该邮箱已注册'))
  }

  const passwordHash = await Bun.password.hash(password)
  users.create(email, passwordHash)

  const newUser = users.findByEmail(email)
  if (newUser) {
    const token = await createToken({ id: newUser.id, email: newUser.email })
    setAuthCookie(c, token)
  }

  return c.redirect('/')
})

app.get('/logout', (c) => {
  removeAuthCookie(c)
  return c.redirect('/')
})

app.get('/favorites', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  if (!user) return c.redirect('/login?redirect=' + encodeURIComponent('/favorites'))

  const favs = favorites.listByUser(user.id)
  return c.html(
    <Layout user={user} lang={lang} currentUrl="/favorites">
      <FavoritesPage lang={lang} favorites={favs} />
    </Layout>
  )
})

app.get('/news', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const page = parseInt(c.req.query('page') || '1')
  const data = news.list(page, 10)

  return c.html(
    <Layout user={user} lang={lang} title="行业动态" currentUrl="/news">
      <NewsListPage lang={lang} newsItems={data.items} page={data.page} total={data.total} limit={data.limit} />
    </Layout>
  )
})

app.get('/news/:slug', async (c) => {
  const lang = getLang(c)
  const user = await getAuthUser(c)
  const slug = c.req.param('slug')
  const article = news.findBySlug(slug)

  if (!article) {
    return c.notFound()
  }

  return c.html(
    <Layout user={user} lang={lang} title={article.title} currentUrl={`/news/${slug}`}>
      <NewsDetailPage lang={lang} news={article} />
    </Layout>
  )
})

export default app
