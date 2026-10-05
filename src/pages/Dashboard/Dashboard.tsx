import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, Check, ChevronDown, ChevronLeft, CircleCheck, CirclePlay, Calculator, LockKeyhole, LogOut, Menu, Play, Plus, UserRound, X, type LucideIcon } from 'lucide-react'
import type { SavedProgress } from './studyData'
import { createStudyDays, courseLabel } from './studyData'

type Student = { uid: string; name: string; email: string }
type Section = 'calendar' | 'progress' | 'communication' | 'mathematics' | 'profile'
const universityLogo = `${import.meta.env.BASE_URL}universidad-de-piura-logo.png`

const navItems: Array<{ id: Section; label: string; icon: LucideIcon }> = [
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'progress', label: 'Mi progreso', icon: ChartNoAxesColumnIncreasing },
  { id: 'communication', label: 'Comunicación', icon: BookOpen },
  { id: 'mathematics', label: 'Matemática', icon: Calculator },
  { id: 'profile', label: 'Perfil', icon: UserRound },
]

function readProgress(uid: string): SavedProgress {
  try {
    return JSON.parse(localStorage.getItem(`study-progress-${uid}`) || '{}') as SavedProgress
  } catch {
    return {}
  }
}

function Dashboard({ student, onSignOut }: { student: Student; onSignOut: () => Promise<void> }) {
  const [saved, setSaved] = useState<SavedProgress>(() => readProgress(student.uid))
  const [section, setSection] = useState<Section>('calendar')
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const match = window.location.pathname.match(/^\/day\/(\d+)\/?$/)
    return match ? Number(match[1]) : null
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const days = useMemo(() => createStudyDays(saved), [saved])
  const selected = selectedDay ? days[selectedDay - 1] : undefined
  const completedDays = days.filter((day) => day.status === 'completed').length
  const overall = Math.round(days.reduce((sum, day) => sum + day.progress, 0) / days.length)

  useEffect(() => {
    if (selectedDay && days[selectedDay - 1]?.status === 'locked') {
      window.history.replaceState({}, '', '/')
      setSelectedDay(null)
    }
  }, [days, selectedDay])

  useEffect(() => {
    localStorage.setItem(`study-progress-${student.uid}`, JSON.stringify(saved))
  }, [saved, student.uid])

  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/day\/(\d+)\/?$/)
      setSelectedDay(match ? Number(match[1]) : null)
      if (!match) setSection('calendar')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function openDay(day: number) {
    if (days[day - 1]?.status === 'locked') return
    window.history.pushState({}, '', `/day/${day}`)
    setSelectedDay(day)
    setSection('calendar')
    window.scrollTo(0, 0)
  }

  function navigate(next: Section) {
    setSection(next)
    setSelectedDay(null)
    if (window.location.pathname.startsWith('/day/')) window.history.pushState({}, '', '/')
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }

  function updateDay(day: number, change: (current: { videosCompleted: number; exercisesCompleted: number }) => { videosCompleted: number; exercisesCompleted: number }) {
    setSaved((current) => ({ ...current, [day]: change(current[day] || { videosCompleted: 0, exercisesCompleted: 0 }) }))
  }

  return (
    <div className="dashboard-shell">
      <header className="mobile-header">
        <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <img src={universityLogo} alt="Universidad de Piura" />
        <button className="icon-button user-shortcut" aria-label="Ver perfil" onClick={() => navigate('profile')}><UserRound size={18} /></button>
      </header>

      <aside className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="brand-lockup">
          <img src={universityLogo} alt="Universidad de Piura" />
        </div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item${section === item.id && !selected ? ' is-active' : ''}`} onClick={() => navigate(item.id)}>
              <item.icon className="nav-icon" size={18} strokeWidth={1.8} aria-hidden="true" />{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-progress">
          <strong>Tu progreso general</strong>
          <div className="progress-summary">
          <span className="progress-ring" style={{ '--progress': `${overall}%` } as CSSProperties}><b>{overall}%</b></span>
            <span>{completedDays} de 48 días<br />completados</span>
          </div>
        </div>
      </aside>

      {menuOpen && <button className="menu-scrim" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}

      <main className="dashboard-main">
        <header className="desktop-topbar">
          <div><h1>¡Hola, {student.name.split(' ')[0]}!</h1><p>Sigue tu plan de estudio y avanza día a día.</p></div>
          <button className="account-menu" onClick={() => navigate('profile')}><span className="avatar"><UserRound size={16} /></span><span>{student.name}</span><ChevronDown size={15} aria-hidden="true" /></button>
        </header>

        {selected ? (
          <section className="day-detail">
            <button className="back-link" onClick={() => { window.history.pushState({}, '', '/'); setSelectedDay(null) }}><ChevronLeft size={17} aria-hidden="true" /><span>Volver al calendario</span></button>
            <div className="detail-heading"><CalendarDays className="calendar-symbol" size={27} aria-hidden="true" /><div><p>Día {selected.day}</p><h2>{courseLabel(selected.course)}</h2><span>{selected.title}</span></div></div>
            <div className="detail-progress"><div><strong>Tu avance</strong><b>{selected.progress}%</b></div><div className="track"><span style={{ width: `${selected.progress}%` }} /></div><p>Videos 60% <span>·</span> Ejercicios 40%</p></div>
            {selected.course === 'practice' ? (
              <div className="activity-card"><h3>Práctica global</h3><p>Resuelve la práctica acumulativa para completar este día y continuar con el plan.</p>
                {selected.status === 'completed' ? <p className="activity-success"><CircleCheck size={17} aria-hidden="true" /> Práctica completada</p> : <button className="primary-action" onClick={() => updateDay(selected.day, (current) => ({ ...current, exercisesCompleted: 1 }))}>Completar práctica</button>}
              </div>
            ) : (
              <>
                <div className="activity-card"><h3>Videos del tema</h3><p>Completa los tres videos para avanzar y desbloquear el siguiente día.</p>
                  <div className="video-list">{Array.from({ length: selected.totalVideos }, (_, index) => (
                    <label key={index} className="video-row"><span className={`video-dot${selected.videosCompleted > index ? ' is-done' : ''}`}>{selected.videosCompleted > index ? <Check size={15} /> : <Play size={13} />}</span><span>Video {index + 1}<small>{selected.videosCompleted > index ? 'Completado' : 'Pendiente'}</small></span><input type="checkbox" checked={selected.videosCompleted > index} onChange={(event) => updateDay(selected.day, (current) => ({ ...current, videosCompleted: event.target.checked ? Math.max(current.videosCompleted, index + 1) : Math.min(current.videosCompleted, index) }))} aria-label={`Marcar video ${index + 1} como completado`} /></label>
                  ))}</div>
                </div>
                <div className="activity-card exercise-card"><div><h3>Ejercicios</h3><p>Resueltos: {selected.exercisesCompleted} de 20</p></div><button className="secondary-action" disabled={selected.videosCompleted < selected.totalVideos || selected.exercisesCompleted >= 20} onClick={() => updateDay(selected.day, (current) => ({ ...current, exercisesCompleted: Math.min(20, current.exercisesCompleted + 1) }))}><Plus size={15} /> Registrar ejercicio</button></div>
              </>
            )}
          </section>
        ) : section === 'calendar' ? (
          <section className="calendar-section">
            <div className="section-heading"><div className="heading-title"><CalendarDays className="calendar-symbol" size={26} aria-hidden="true" /><div><h2>Calendario de estudio</h2><p>Cada día desbloquea nuevos contenidos. Completa los videos para acceder al siguiente.</p></div></div>
              <div className="status-legend"><span><i className="legend-dot available-dot" />Disponible</span><span><i className="legend-dot locked-dot" />Bloqueado</span><span><i className="legend-dot complete-dot" />Completado</span></div>
            </div>
            <div className="days-grid">{days.map((day) => { const StatusIcon = day.status === 'locked' ? LockKeyhole : day.status === 'completed' ? CircleCheck : CirclePlay; return <button key={day.day} className={`day-card status-${day.status}`} disabled={day.status === 'locked'} onClick={() => openDay(day.day)}>
              <span className="day-card-top"><StatusIcon className="day-state-icon" size={16} strokeWidth={1.8} aria-hidden="true" /><strong>Día {day.day}</strong></span>
              <strong className="day-course">{courseLabel(day.course)}</strong><span className="day-title">{day.title}</span>
              <span className="day-progress-line"><span className="day-meter"><i style={{ width: `${day.progress}%` }} /></span><span className="day-percent">{day.progress}%</span></span>
            </button> })}</div>
          </section>
        ) : section === 'progress' ? (
        <section className="content-panel"><h2>Mi progreso</h2><p className="panel-intro">Tu avance en el plan de estudio.</p><div className="big-progress"><span className="progress-ring" style={{ '--progress': `${overall}%` } as CSSProperties}><b>{overall}%</b></span><div><strong>{completedDays} de 48 días completados</strong><p>El progreso global se calcula con el avance de todos los días.</p></div></div><div className="subject-progress"><div><span>Matemática</span><b>{days.filter((day) => day.course === 'mathematics' && day.progress >= 100).length} días completados</b></div><div><span>Comunicación</span><b>{days.filter((day) => day.course === 'communication' && day.progress >= 100).length} días completados</b></div></div></section>
        ) : section === 'profile' ? (
          <section className="content-panel"><h2>Perfil</h2><div className="profile-card"><span className="large-avatar"><UserRound size={22} /></span><div><strong>{student.name}</strong><p>{student.email}</p></div></div><button className="signout-button" onClick={() => void onSignOut()}><LogOut size={16} /> Cerrar sesión</button></section>
        ) : (
          <section className="content-panel"><h2>{section === 'communication' ? 'Comunicación' : 'Matemática'}</h2><p className="panel-intro">Tus días de {section === 'communication' ? 'Comunicación' : 'Matemática'} en el calendario.</p><div className="subject-day-list">{days.filter((day) => day.course === section).map((day) => <button key={day.day} className="subject-day-row" disabled={day.status === 'locked'} onClick={() => openDay(day.day)}><span>Día {day.day}</span><strong>{day.title}</strong><b>{day.progress}%</b></button>)}</div></section>
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegación inferior">{(['calendar', 'progress', 'communication', 'mathematics'] as Section[]).map((id) => { const item = navItems.find((entry) => entry.id === id)!; return <button key={id} className={section === id ? 'is-active' : ''} onClick={() => navigate(id)}><item.icon size={18} strokeWidth={1.8} aria-hidden="true" />{id === 'progress' ? 'Progreso' : item.label}</button> })}</nav>
    </div>
  )
}

export default Dashboard
