import { useState, type FormEvent } from 'react'
import './Login.css'

type Feedback = { kind: 'success' | 'error'; message: string } | null

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

function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo. Usa “Ya creé una cuenta” para ingresar.'
    case 'auth/invalid-email':
      return 'Escribe un correo electrónico válido.'
    case 'auth/weak-password':
      return 'La clave debe tener al menos 6 caracteres.'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'El correo o la clave no son correctos.'
    case 'auth/network-request-failed':
      return 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.'
    default:
      return 'No se pudo completar la operación. Inténtalo de nuevo.'
  }
}

function Login() {
  const [isExistingAccount, setIsExistingAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setFeedback(null)

    const formData = new FormData(event.currentTarget)
    const names = String(formData.get('names') ?? '').trim()
    const lastNames = String(formData.get('lastNames') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')

    try {
      const [firebase, authSdk, firestoreSdk] = await Promise.all([
        import('../../lib/firebase'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ])
      const { auth, db } = await firebase.getFirebaseServices()

      if (isExistingAccount) {
        await authSdk.signInWithEmailAndPassword(auth, email, password)
        setFeedback({ kind: 'success', message: 'Sesión iniciada correctamente.' })
      } else {
        const credential = await authSdk.createUserWithEmailAndPassword(auth, email, password)
        try {
          await firestoreSdk.setDoc(firestoreSdk.doc(db, 'users', credential.user.uid), {
            nombres: names,
            apellidos: lastNames,
            correo: email,
            createdAt: firestoreSdk.serverTimestamp(),
          })
        } catch {
          setFeedback({
            kind: 'error',
            message: 'La cuenta se creó, pero no se pudo guardar el perfil. Revisa las reglas de Firestore.',
          })
          return
        }
        setFeedback({ kind: 'success', message: 'Cuenta creada e ingreso correcto.' })
      }
    } catch (error) {
      setFeedback({ kind: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleAccountMode() {
    setIsExistingAccount((current) => !current)
    setFeedback(null)
  }

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

            <form
              className={`login-form${isExistingAccount ? ' is-existing-account' : ''}`}
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <div
                className={`form-group form-group--collapsible${isExistingAccount ? ' is-hidden' : ''}`}
                aria-hidden={isExistingAccount}
                inert={isExistingAccount}
              >
                <label htmlFor="names"><span className="field-icon"><PersonIcon /></span>Nombres</label>
                <input
                  id="names"
                  name="names"
                  type="text"
                  placeholder="Ingresa tus nombres"
                  autoComplete="given-name"
                  required={!isExistingAccount}
                  tabIndex={isExistingAccount ? -1 : undefined}
                />
              </div>
              <div
                className={`form-group form-group--collapsible${isExistingAccount ? ' is-hidden' : ''}`}
                aria-hidden={isExistingAccount}
                inert={isExistingAccount}
              >
                <label htmlFor="lastNames"><span className="field-icon"><PersonIcon /></span>Apellidos</label>
                <input
                  id="lastNames"
                  name="lastNames"
                  type="text"
                  placeholder="Ingresa tus apellidos"
                  autoComplete="family-name"
                  required={!isExistingAccount}
                  tabIndex={isExistingAccount ? -1 : undefined}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email"><span className="field-icon"><MailIcon /></span>Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password"><span className="field-icon"><LockIcon /></span>Clave</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ingresa tu clave"
                  autoComplete={isExistingAccount ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                />
              </div>

              {feedback && (
                <p className={`login-feedback login-feedback--${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
                  {feedback.message}
                </p>
              )}

              <button className="account-mode-button" type="button" onClick={toggleAccountMode} disabled={isSubmitting}>
                {isExistingAccount ? 'Crear una cuenta' : 'Ya creé una cuenta'}
              </button>
              <button className="login-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando…' : 'Ingresar'} <span aria-hidden="true">›</span>
              </button>
            </form>

            <p className="login-footer"><span />Tu esfuerzo de hoy construye tus oportunidades de mañana<span /></p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
