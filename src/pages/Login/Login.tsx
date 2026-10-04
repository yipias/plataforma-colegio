import { useState, type FormEvent } from 'react'
import { BookOpen, ChartNoAxesColumnIncreasing, GraduationCap, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import './Login.css'

type Feedback = { kind: 'success' | 'error'; message: string } | null

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

function Login({ onAuthenticated }: { onAuthenticated: (student: { uid: string; name: string; email: string }) => void }) {
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
        const credential = await authSdk.signInWithEmailAndPassword(auth, email, password)
        const fullName = credential.user.displayName?.trim() || email.split('@')[0]
        onAuthenticated({ uid: credential.user.uid, name: fullName || email.split('@')[0], email: credential.user.email || email })
      } else {
        const credential = await authSdk.createUserWithEmailAndPassword(auth, email, password)
        onAuthenticated({ uid: credential.user.uid, name: `${names} ${lastNames}`.trim(), email: credential.user.email || email })
        await authSdk.updateProfile(credential.user, { displayName: `${names} ${lastNames}`.trim() })
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
              <li><span className="benefit-icon" aria-hidden="true"><BookOpen size={18} /></span>Temario completo</li>
              <li><span className="benefit-icon" aria-hidden="true"><ChartNoAxesColumnIncreasing size={18} /></span>Avance progresivo</li>
              <li><span className="benefit-icon" aria-hidden="true"><Sparkles size={18} /></span>Ejercicios por tema</li>
            </ul>
          </div>
        </aside>

        <div className="login-panel">
          <div className="login-panel-inner">
            <header className="login-heading">
              <GraduationCap className="graduation-mark" aria-hidden="true" />
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
                <label htmlFor="names"><span className="field-icon"><UserRound /></span>Nombres</label>
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
                <label htmlFor="lastNames"><span className="field-icon"><UserRound /></span>Apellidos</label>
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
                <label htmlFor="email"><span className="field-icon"><Mail /></span>Correo electrónico</label>
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
                <label htmlFor="password"><span className="field-icon"><LockKeyhole /></span>Clave</label>
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
