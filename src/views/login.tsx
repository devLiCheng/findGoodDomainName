import { t, type Lang } from './i18n'

interface LoginProps {
  lang?: Lang
  error?: string
  redirect?: string
  mode?: 'login' | 'register'
}

export function LoginPage({ lang = 'zh', error, redirect = '/', mode = 'login' }: LoginProps) {
  const i18n = (key: string) => t(lang, key)
  const isLogin = mode === 'login'

  return (
    <div class="auth-wrap">
      <h2>{isLogin ? i18n('login') : i18n('register')}</h2>
      {error && <div class="error-box" style="margin-bottom:16px;">{error}</div>}
      <form method="POST" action={isLogin ? '/login' : '/register'}>
        {redirect && redirect !== '/' && <input type="hidden" name="redirect" value={redirect} />}
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label>{i18n('password')}</label>
          <input type="password" name="password" required minlength={6} placeholder="******" />
        </div>
        <button type="submit" class="btn btn-primary">{isLogin ? i18n('login') : i18n('register')}</button>
      </form>
      <div class="auth-link">
        {isLogin ? (
          <span>{i18n('noAccount')} <a href="/register">{i18n('register')}</a></span>
        ) : (
          <span>{i18n('haveAccount')} <a href="/login">{i18n('login')}</a></span>
        )}
      </div>
    </div>
  )
}
