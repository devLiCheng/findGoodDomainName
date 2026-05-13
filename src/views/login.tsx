import { t, type Lang } from './i18n'

interface LoginProps {
  lang?: Lang
  error?: string
  redirect?: string
}

export function LoginPage({ lang = 'zh', error, redirect = '/' }: LoginProps) {
  const i18n = (key: string) => t(lang, key)

  return (
    <div class="auth-wrap">
      <h2>{i18n('signin')}</h2>
      <div class="auth-hint" style="margin-bottom:24px;">
        {lang === 'zh' ? '输入邮箱，新用户自动注册，老用户直接登录' : 'Enter your email. New users are auto-registered.'}
      </div>
      {error && <div class="error-box" style="margin-bottom:16px;">{error}</div>}
      <form method="POST" action="/login">
        {redirect && redirect !== '/' && <input type="hidden" name="redirect" value={redirect} />}
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="your@email.com" autofocus />
        </div>
        <div class="form-group">
          <label>{i18n('password')}</label>
          <input type="password" name="password" required minlength={6} placeholder="******" />
        </div>
        <button type="submit" class="btn btn-primary">{i18n('signin')}</button>
      </form>
    </div>
  )
}
