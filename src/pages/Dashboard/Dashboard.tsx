import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, Check, ChevronDown, ChevronLeft, CircleCheck, CirclePlay, Calculator, LockKeyhole, LogOut, Menu, Play, UserRound, X, type LucideIcon } from 'lucide-react'
import type { SavedDayProgress, SavedProgress } from './studyData'
import { createStudyDays, courseLabel, DAY_ONE_VIDEO_IDS, DAY_TWO_VIDEO_IDS, migrateSavedProgress } from './studyData'

type Student = { uid: string; name: string; email: string }
type Section = 'calendar' | 'progress' | 'communication' | 'mathematics' | 'profile'
const universityLogo = `${import.meta.env.BASE_URL}universidad-de-piura-logo.png`

const dayOneExercises = [
  { question: '7 + (-3) - 5', options: ['-5', '-3', '-1', '1', '5'], answer: 2 },
  { question: '12 - (-4) + (-7)', options: ['1', '5', '7', '9', '23'], answer: 3 },
  { question: '8 - (3 - 5)', options: ['0', '6', '8', '10', '12'], answer: 3 },
  { question: '-6 - (-2 + 7)', options: ['-15', '-11', '-7', '1', '11'], answer: 1 },
  { question: '14 - [6 - (3 - 8)]', options: ['-3', '1', '3', '5', '11'], answer: 2 },
  { question: '4 - 3(2 - 5)', options: ['-13', '-5', '5', '9', '13'], answer: 4 },
  { question: '2[5 - (3 - 7)] - 4', options: ['6', '10', '12', '14', '18'], answer: 3 },
  { question: '18 \u00f7 3 + 2 \u00d7 5 - 4', options: ['6', '8', '10', '12', '16'], answer: 3 },
  { question: '30 - 4(6 - 2) \u00f7 2', options: ['14', '18', '22', '26', '34'], answer: 2 },
  { question: '48 \u00f7 [2(3 + 5)]', options: ['1.5', '2', '3', '8', '12'], answer: 2 },
  { question: '5 + 2\u00b3 \u00d7 3', options: ['21', '24', '29', '35', '49'], answer: 2 },
  { question: '\u221a81 + 4(7 - 5)', options: ['11', '13', '15', '17', '21'], answer: 3 },
  { question: '2\u2074 - \u221a49 + 3\u00b2', options: ['2', '10', '16', '18', '32'], answer: 3 },
  { question: '(-3)\u00b2 + (-2)\u00b3', options: ['-17', '-1', '0', '1', '17'], answer: 3 },
  { question: '-3\u00b2 + (-3)\u00b2', options: ['-18', '-9', '0', '9', '18'], answer: 2 },
  { question: '[2\u00b3 + \u221a64] \u00f7 4', options: ['2', '4', '6', '8', '16'], answer: 1 },
  { question: '6 - {2[3 - (5 - 8)]}', options: ['-18', '-12', '-6', '6', '18'], answer: 2 },
  { question: '2\u00b3[10 - \u221a36] + 4', options: ['12', '28', '32', '36', '40'], answer: 3 },
  { question: '(18 \u00f7 3)\u00b2 - 5 \u00d7 4', options: ['4', '8', '12', '16', '20'], answer: 3 },
  { question: '-2\u2074 + (-2)\u2074 + \u221a100 \u00f7 2', options: ['-27', '-5', '0', '5', '37'], answer: 3 },
]

const dayTwoExercises = [
  { question: '8 + 12 \u00f7 3', options: ['20', '6', '12', '16', '10'], answer: 2 },
  { question: '18 \u00f7 3 \u00d7 2', options: ['12', '3', '6', '9', '36'], answer: 0 },
  { question: '20 - 6 + 4', options: ['10', '22', '14', '30', '18'], answer: 4 },
  { question: '5 + 3 \u00d7 4 - 2', options: ['30', '15', '18', '10', '24'], answer: 1 },
  { question: '(8 + 4) \u00f7 3', options: ['6', '12', '3', '4', '8'], answer: 3 },
  { question: '24 \u00f7 (2 + 4) + 5', options: ['7', '11', '6', '9', '14'], answer: 3 },
  { question: '30 - 2 \u00d7 (7 + 3)', options: ['50', '10', '16', '20', '28'], answer: 1 },
  { question: '36 \u00f7 (3 \u00d7 2) + 4', options: ['10', '8', '16', '22', '6'], answer: 0 },
  { question: '2\u00b3 + 6 \u00d7 2', options: ['28', '16', '14', '24', '20'], answer: 4 },
  { question: '3\u00b2 \u00d7 2 + 5', options: ['28', '19', '25', '14', '23'], answer: 4 },
  { question: '\u221a64 + 18 \u00f7 3', options: ['14', '10', '16', '12', '20'], answer: 0 },
  { question: '40 \u00f7 2\u00b3 + 7', options: ['47', '17', '10', '12', '8'], answer: 3 },
  { question: '5 + 2 \u00d7 (3\u00b2 - 4)', options: ['15', '25', '13', '18', '10'], answer: 0 },
  { question: '48 \u00f7 [2 \u00d7 (5 - 1)] + 3', options: ['15', '6', '9', '12', '8'], answer: 2 },
  { question: '50 - (4 \u00d7 3 + 2\u00b3)', options: ['38', '20', '42', '46', '30'], answer: 4 },
  { question: '(18 - 6) \u00f7 (3 + 1) \u00d7 2', options: ['3', '6', '8', '12', '24'], answer: 1 },
  { question: '72 \u00f7 (3 \u00d7 2\u00b2) + 5', options: ['17', '9', '8', '11', '14'], answer: 3 },
  { question: '4 \u00d7 (9 - 5) + 36 \u00f7 (3 \u00d7 2)', options: ['22', '18', '20', '26', '28'], answer: 0 },
  { question: '[30 - 2 \u00d7 (6 + 3)] \u00f7 4 + 7', options: ['12', '8', '10', '14', '16'], answer: 2 },
  { question: '80 \u00f7 [2 \u00d7 (3\u00b2 - 5)] + \u221a16 \u00d7 3', options: ['16', '18', '20', '24', '22'], answer: 4 },
]

const dayTwoExerciseLevels = [
  'NIVEL 1 \u2014 IDENTIFICAR QU\u00c9 OPERACI\u00d3N VA PRIMERO',
  'NIVEL 2 \u2014 SIGNOS DE AGRUPACI\u00d3N',
  'NIVEL 3 \u2014 POTENCIAS, RA\u00cdCES Y JERARQU\u00cdA',
  'NIVEL 4 \u2014 VARIAS REGLAS AL MISMO TIEMPO',
  'NIVEL 5 \u2014 RETO FINAL',
]

const navItems: Array<{ id: Section; label: string; icon: LucideIcon }> = [
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'progress', label: 'Mi progreso', icon: ChartNoAxesColumnIncreasing },
  { id: 'communication', label: 'Comunicación', icon: BookOpen },
  { id: 'mathematics', label: 'Matemática', icon: Calculator },
  { id: 'profile', label: 'Perfil', icon: UserRound },
]

function readProgress(uid: string): SavedProgress {
  try {
    const progressKey = `study-progress-${uid}`
    const migrationKey = `study-progress-curriculum-v2-${uid}`
    const stored = JSON.parse(localStorage.getItem(progressKey) || '{}') as SavedProgress
    if (localStorage.getItem(migrationKey)) return stored
    const migrated = migrateSavedProgress(stored)
    localStorage.setItem(progressKey, JSON.stringify(migrated))
    localStorage.setItem(migrationKey, 'done')
    return migrated
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
  const [activeVideo, setActiveVideo] = useState<{ day: number; videoIndex: number } | null>(null)
  const [exerciseSelections, setExerciseSelections] = useState<Record<string, number>>({})
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

  function updateDay(day: number, change: (current: SavedDayProgress) => SavedDayProgress) {
    setSaved((current) => ({ ...current, [day]: change(current[day] || { videosCompleted: 0, exercisesCompleted: 0 }) }))
  }

  function setVideoCompleted(day: number, videoIndex: number, isCompleted: boolean) {
    const currentIndexes = days[day - 1]?.completedVideoIndexes ?? []
    updateDay(day, (current) => ({
      ...current,
      videosCompleted: undefined,
      completedVideoIndexes: isCompleted
        ? [...new Set([...(current.completedVideoIndexes ?? currentIndexes), videoIndex])]
        : (current.completedVideoIndexes ?? currentIndexes).filter((index) => index !== videoIndex),
    }))
  }

  function openVideo(day: number, videoIndex: number) {
    setVideoCompleted(day, videoIndex, true)
    setActiveVideo({ day, videoIndex })
  }

  function answerExercise(day: number, exerciseIndex: number, optionIndex: number) {
    const exercises = day === 2 ? dayTwoExercises : dayOneExercises
    const correct = exercises[exerciseIndex]?.answer === optionIndex
    setExerciseSelections((current) => ({ ...current, [`${day}:${exerciseIndex}`]: optionIndex }))
    if (!correct) return
    updateDay(day, (current) => {
      const completed = current.completedExerciseIndexes ?? days[day - 1]?.completedExerciseIndexes ?? []
      return { ...current, exercisesCompleted: undefined, completedExerciseIndexes: [...new Set([...completed, exerciseIndex])] }
    })
  }

  useEffect(() => {
    if (!activeVideo) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveVideo(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [activeVideo])

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
            <span>{completedDays} de {days.length} días<br />completados</span>
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
                <div className="activity-card"><h3>Videos del tema</h3><p>Completa los {selected.totalVideos} videos para avanzar y desbloquear el siguiente día.</p>
                  <div className="video-list">{Array.from({ length: selected.totalVideos }, (_, index) => (
                    <div key={index} className="video-row"><button className="video-open-button" onClick={() => openVideo(selected.day, index)} aria-label={`Reproducir video ${index + 1}`}><span className={`video-dot${selected.completedVideoIndexes.includes(index) ? ' is-done' : ''}`}>{selected.completedVideoIndexes.includes(index) ? <Check size={15} /> : <Play size={13} />}</span><span>Video {index + 1}<small>{selected.completedVideoIndexes.includes(index) ? 'Completado' : 'Pendiente'}</small></span></button><label className="video-check"><input type="checkbox" checked={selected.completedVideoIndexes.includes(index)} onChange={(event) => setVideoCompleted(selected.day, index, event.target.checked)} aria-label={`Marcar video ${index + 1} como completado`} /></label></div>
                  ))}</div>
                </div>
                {selected.day === 1 || selected.day === 2 ? (
                  <section className="activity-card exercise-quiz" aria-labelledby="exercise-quiz-title">
                    <div className="quiz-heading"><div><h3 id="exercise-quiz-title">{selected.day === 2 ? 'Jerarquía de operaciones' : 'Ejercicios de práctica'}</h3><p>Resueltos correctamente: {selected.exercisesCompleted} de 20</p></div><span className="quiz-counter">20 ejercicios</span></div>
                    <div className="quiz-exercise-list">{(selected.day === 2 ? dayTwoExercises : dayOneExercises).map((exercise, exerciseIndex) => {
                      const completed = selected.completedExerciseIndexes.includes(exerciseIndex)
                      const selectedOption = exerciseSelections[`${selected.day}:${exerciseIndex}`]
                      const chosenCorrect = completed || selectedOption === exercise.answer
                      return <article className={'quiz-exercise' + (completed ? ' is-correct' : selectedOption !== undefined ? ' is-incorrect' : '')} key={exerciseIndex}>
                        {selected.day === 2 && exerciseIndex % 4 === 0 && <h4 className="quiz-level-title">{dayTwoExerciseLevels[exerciseIndex / 4]}</h4>}
                        <div className="quiz-question"><span>Ejercicio {exerciseIndex + 1}</span><strong>{exercise.question}</strong></div>
                        <div className="quiz-options">{exercise.options.map((option, optionIndex) => {
                          const isRight = optionIndex === exercise.answer && chosenCorrect
                          const isWrongChoice = !completed && selectedOption === optionIndex && optionIndex !== exercise.answer
                          return <button key={optionIndex} disabled={completed} className={'quiz-option' + (isRight ? ' is-correct' : isWrongChoice ? ' is-incorrect' : '')} onClick={() => answerExercise(selected.day, exerciseIndex, optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>
                        })}</div>
                        {selectedOption !== undefined && !completed && selectedOption !== exercise.answer && <p className="quiz-feedback is-encouragement">&iexcl;T&uacute; puedes, sigue intent&aacute;ndolo!</p>}
                      </article>
                    })}</div>
                    {selected.day === 2 && <div className="quiz-study-guide"><section><h4>Reglas que se practican</h4><ol><li>Resolver primero los signos de agrupación: ( ), [ ], {'{ }'}.</li><li>Resolver potencias y raíces.</li><li>Resolver multiplicaciones y divisiones de izquierda a derecha.</li><li>Resolver sumas y restas de izquierda a derecha.</li></ol></section><section><h4>Progresión</h4><ul><li>Ejercicios 1 al 4: prioridad entre operaciones básicas.</li><li>Ejercicios 5 al 8: paréntesis y agrupaciones.</li><li>Ejercicios 9 al 12: potencias y raíces.</li><li>Ejercicios 13 al 16: varias reglas combinadas.</li><li>Ejercicios 17 al 20: expresiones más largas.</li></ul></section></div>}
                  </section>
                ) : <div className="activity-card exercise-card"><div><h3>Ejercicios</h3><p>Resueltos: {selected.exercisesCompleted} de {selected.totalExercises}</p></div><p className="exercise-coming-soon">Los ejercicios de este d&iacute;a estar&aacute;n disponibles pr&oacute;ximamente.</p></div>}
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
        <section className="content-panel"><h2>Mi progreso</h2><p className="panel-intro">Tu avance en el plan de estudio.</p><div className="big-progress"><span className="progress-ring" style={{ '--progress': `${overall}%` } as CSSProperties}><b>{overall}%</b></span><div><strong>{completedDays} de {days.length} días completados</strong><p>El progreso global se calcula con el avance de todos los días.</p></div></div><div className="subject-progress"><div><span>Matemática</span><b>{days.filter((day) => day.course === 'mathematics' && day.progress >= 100).length} días completados</b></div><div><span>Comunicación</span><b>{days.filter((day) => day.course === 'communication' && day.progress >= 100).length} días completados</b></div></div></section>
        ) : section === 'profile' ? (
          <section className="content-panel"><h2>Perfil</h2><div className="profile-card"><span className="large-avatar"><UserRound size={22} /></span><div><strong>{student.name}</strong><p>{student.email}</p></div></div><button className="signout-button" onClick={() => void onSignOut()}><LogOut size={16} /> Cerrar sesión</button></section>
        ) : (
          <section className="content-panel"><h2>{section === 'communication' ? 'Comunicación' : 'Matemática'}</h2><p className="panel-intro">Tus días de {section === 'communication' ? 'Comunicación' : 'Matemática'} en el calendario.</p><div className="subject-day-list">{days.filter((day) => day.course === section).map((day) => <button key={day.day} className="subject-day-row" disabled={day.status === 'locked'} onClick={() => openDay(day.day)}><span>Día {day.day}</span><strong>{day.title}</strong><b>{day.progress}%</b></button>)}</div></section>
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegación inferior">{(['calendar', 'progress', 'communication', 'mathematics'] as Section[]).map((id) => { const item = navItems.find((entry) => entry.id === id)!; return <button key={id} className={section === id ? 'is-active' : ''} onClick={() => navigate(id)}><item.icon size={18} strokeWidth={1.8} aria-hidden="true" />{id === 'progress' ? 'Progreso' : item.label}</button> })}</nav>
      {activeVideo && <div className="video-modal-backdrop" role="presentation" onClick={() => setActiveVideo(null)}><section className="video-modal" role="dialog" aria-modal="true" aria-label={`Día ${activeVideo.day}: Vídeo ${activeVideo.videoIndex + 1}`} onClick={(event) => event.stopPropagation()}><header><strong>Día {activeVideo.day}: Vídeo {activeVideo.videoIndex + 1}</strong><button className="video-modal-close" onClick={() => setActiveVideo(null)} aria-label="Cerrar video"><X size={20} /></button></header><div className="video-player-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${(activeVideo.day === 2 ? DAY_TWO_VIDEO_IDS : DAY_ONE_VIDEO_IDS)[activeVideo.videoIndex]}?autoplay=1&rel=0`} title={`Vídeo ${activeVideo.videoIndex + 1} de la lista de reproducción`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div></section></div>}
    </div>
  )
}

export default Dashboard
