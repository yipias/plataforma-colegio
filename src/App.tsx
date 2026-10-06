import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChartNoAxesColumnIncreasing, Sparkles } from 'lucide-react'
import type { User } from 'firebase/auth'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import { getFirebaseServices } from './lib/firebase'
import './pages/Dashboard/Dashboard.css'

type Student = { uid: string; name: string; email: string }

function App() {
  const [student, setStudent] = useState<Student | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isWelcoming, setIsWelcoming] = useState(false)
  const welcomedUid = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined

    void getFirebaseServices().then(async ({ auth }) => {
      const { onAuthStateChanged } = await import('firebase/auth')
      if (!active) return
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          welcomedUid.current = null
          setStudent(null)
          setIsWelcoming(false)
          setIsCheckingSession(false)
          return
        }
        const profile = await loadStudentProfile(user)
        if (!active) return
        if (welcomedUid.current !== user.uid) {
          setStudent(profile)
          welcomedUid.current = user.uid
          setIsWelcoming(true)
        }
        setIsCheckingSession(false)
      })
    }).catch(() => {
      if (active) setIsCheckingSession(false)
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!isWelcoming) return
    const timeout = window.setTimeout(() => setIsWelcoming(false), 1900)
    return () => window.clearTimeout(timeout)
  }, [isWelcoming])

  async function handleSignOut() {
    const { auth } = await getFirebaseServices()
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  }

  function handleAuthenticated(authenticatedStudent: Student) {
    welcomedUid.current = authenticatedStudent.uid
    setStudent(authenticatedStudent)
    setIsCheckingSession(false)
    setIsWelcoming(true)
  }

  if (isCheckingSession) {
    return <main className="session-loading" aria-label="Cargando sesión"><span className="loading-spinner" /></main>
  }

  if (!student) return <Login onAuthenticated={handleAuthenticated} />

  if (isWelcoming) {
    return (
      <main className="login-page welcome-login" role="status" aria-live="polite">
        <section className="login-card" aria-label="Bienvenida">
          <aside className="login-story">
            <div className="story-content">
              <div className="story-copy">
                <h1>Prepárate<br />para tu futuro</h1>
                <span className="story-rule" />
                <p>Tu plan de estudio está listo. Avanza paso a paso hacia tus metas.</p>
              </div>
              <ul className="story-benefits">
                <li><span className="benefit-icon" aria-hidden="true"><BookOpen size={18} /></span>Temario completo</li>
                <li><span className="benefit-icon" aria-hidden="true"><ChartNoAxesColumnIncreasing size={18} /></span>Avance progresivo</li>
                <li><span className="benefit-icon" aria-hidden="true"><Sparkles size={18} /></span>Ejercicios por tema</li>
              </ul>
            </div>
          </aside>
          <section className="login-panel">
            <div className="login-panel-inner welcome-panel-inner">
              <header className="login-heading welcome-content">
                <h2>Hola, {student.name}</h2>
                <p>Estamos preparando tu espacio de estudio</p>
                <span className="loading-spinner" aria-label="Cargando" />
              </header>
            </div>
          </section>
        </section>
      </main>
    )
  }

  return <Dashboard key={student.uid} student={student} onSignOut={handleSignOut} />
}

async function loadStudentProfile(user: User): Promise<Student> {
  let name = user.displayName?.trim() || ''
  try {
    const { db } = await getFirebaseServices()
    const { doc, getDoc } = await import('firebase/firestore')
    const profile = await getDoc(doc(db, 'users', user.uid))
    if (profile.exists()) {
      const data = profile.data()
      name = [data.nombres, data.apellidos].filter(Boolean).join(' ').trim() || name
    }
  } catch {
    // Use the Firebase Auth name when the profile cannot be read.
  }
  return { uid: user.uid, name: name || user.email?.split('@')[0] || 'Estudiante', email: user.email || '' }
}

export default App
