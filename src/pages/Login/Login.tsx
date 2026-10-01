import { useState } from 'react'
import './Login.css'

function GraduationMark() {
  return (
    <svg className="graduation-mark" viewBox="0 0 64 48" aria-hidden="true">
      <path d="M2 14 32 2l30 12-30 12L2 14Z" fill="currentColor" />
      <path d="M13 20v12c10 9 28 9 38 0V20L32 29 13 20Z" fill="currentColor" />
      <path d="M60 15v17" stroke="#b6232d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="35" r="3" fill="#b6232d" />
    </svg>
  )
}

function PersonIcon() {
  return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" /></svg>
}

function MailIcon() {
  return <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
}

function LockIcon() {
  return <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>
}

function Login() {
  const [isExistingAccount, setIsExistingAccount] = useState(false)

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Acceso a la plataforma">
        <aside className="login-story">
          <div className="story-content">
            <div className="story-copy">
              <h1>Prepárate<br />para tu futuro</h1>
              <span className="story-rule" />
              <p>Refuerza tus conocimientos en Comunicación y Matemática con un plan de estudio estructurado.</p>
            </div>
            <ul className="story-benefits">
              <li><span className="benefit-icon" aria-hidden="true">▤</span>Temario completo</li>
              <li><span className="benefit-icon" aria-hidden="true">▥</span>Avance progresivo</li>
              <li><span className="benefit-icon" aria-hidden="true">✧</span>Ejercicios por tema</li>
            </ul>
          </div>
        </aside>

        <div className="login-panel">
          <div className="login-panel-inner">
            <header className="login-heading">
              <GraduationMark />
              <h2 id="login-title">Comienza ahora</h2>
              {!isExistingAccount && <p>Ingresa tus datos para comenzar</p>}
            </header>

            <form className={`login-form${isExistingAccount ? ' is-existing-account' : ''}`} onSubmit={(event) => event.preventDefault()}>
              <div className={`form-group form-group--collapsible${isExistingAccount ? ' is-hidden' : ''}`} aria-hidden={isExistingAccount} inert={isExistingAccount}>
                <label htmlFor="names"><span className="field-icon"><PersonIcon /></span>Nombres</label>
                <input id="names" name="names" type="text" placeholder="Ingresa tus nombres" autoComplete="given-name" tabIndex={isExistingAccount ? -1 : undefined} />
              </div>
              <div className={`form-group form-group--collapsible${isExistingAccount ? ' is-hidden' : ''}`} aria-hidden={isExistingAccount} inert={isExistingAccount}>
                <label htmlFor="lastNames"><span className="field-icon"><PersonIcon /></span>Apellidos</label>
                <input id="lastNames" name="lastNames" type="text" placeholder="Ingresa tus apellidos" autoComplete="family-name" tabIndex={isExistingAccount ? -1 : undefined} />
              </div>
              <div className="form-group">
                <label htmlFor="email"><span className="field-icon"><MailIcon /></span>Correo electrónico</label>
                <input id="email" name="email" type="email" placeholder="Ingresa tu correo electrónico" autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="password"><span className="field-icon"><LockIcon /></span>Clave</label>
                <input id="password" name="password" type="password" placeholder="Ingresa tu clave" autoComplete="current-password" />
              </div>
              <button className="account-mode-button" type="button" onClick={() => setIsExistingAccount((current) => !current)}>
                {isExistingAccount ? 'Crear una cuenta' : 'Ya creé una cuenta'}
              </button>
              <button className="login-button" type="submit">Ingresar <span aria-hidden="true">›</span></button>
            </form>

            <p className="login-footer"><span />Tu esfuerzo de hoy construye tus oportunidades de mañana<span /></p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
