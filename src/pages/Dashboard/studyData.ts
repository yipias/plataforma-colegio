export type Course = 'mathematics' | 'communication' | 'practice'
export type DayStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export type StudyDay = {
  id: number
  day: number
  course: Course
  title: string
  videosCompleted: number
  completedVideoIndexes: number[]
  completedExerciseIndexes: number[]
  totalVideos: number
  exercisesCompleted: number
  totalExercises: number
  progress: number
  status: DayStatus
}

const curriculum: Array<[Course, string]> = [
  ['mathematics', 'Operaciones básicas y jerarquía de operaciones'],
  ['mathematics', 'Números naturales, primos, compuestos y divisibilidad'],
  ['communication', 'Formación de palabras y relaciones semánticas'],
  ['mathematics', 'Fundamentos de fracciones'],
  ['mathematics', 'Operaciones con fracciones y decimales'],
  ['practice', 'Práctica global 1'],
  ['mathematics', 'Números enteros, signos y valor absoluto'],
  ['mathematics', 'Números racionales, irracionales y reales'],
  ['communication', 'Frase, proposición, oración y concordancia'],
  ['mathematics', 'Potencias y propiedades'],
  ['mathematics', 'Radicación y operaciones con radicales'],
  ['practice', 'Práctica global 2'],
  ['mathematics', 'Razones, proporciones y porcentajes'],
  ['mathematics', 'Conjuntos numéricos e intervalos'],
  ['communication', 'Eliminación de oraciones y coherencia textual'],
  ['mathematics', 'Introducción al lenguaje algebraico'],
  ['mathematics', 'Operaciones con expresiones algebraicas'],
  ['practice', 'Práctica global 3'],
  ['mathematics', 'Polinomios y operaciones'],
  ['mathematics', 'Factorización básica'],
  ['communication', 'Comprensión lectora I: tema e idea principal'],
  ['mathematics', 'Fracciones algebraicas'],
  ['mathematics', 'Ecuaciones de primer grado'],
  ['practice', 'Práctica global 4'],
  ['mathematics', 'Desigualdades de primer grado'],
  ['mathematics', 'Ecuaciones cuadráticas'],
  ['communication', 'Comprensión lectora II: inferencias e intención comunicativa'],
  ['mathematics', 'Desigualdades cuadráticas'],
  ['mathematics', 'Sistemas de ecuaciones de dos incógnitas'],
  ['practice', 'Práctica global 5'],
  ['mathematics', 'Plano cartesiano y concepto de función'],
  ['mathematics', 'Función lineal y su gráfica'],
  ['communication', 'Plan de redacción y estructura textual'],
  ['mathematics', 'Función cuadrática'],
  ['mathematics', 'Valor absoluto, máximo entero y gráficas'],
  ['practice', 'Práctica global 6'],
  ['mathematics', 'Ángulos y propiedades fundamentales'],
  ['mathematics', 'Triángulos, congruencia y semejanza'],
  ['communication', 'Cohesión, conectores y tipología textual'],
  ['mathematics', 'Cuadriláteros y polígonos'],
  ['mathematics', 'Áreas, circunferencia y círculo'],
  ['practice', 'Práctica global 7'],
  ['mathematics', 'Logaritmos y propiedades'],
  ['mathematics', 'Geometría analítica: ecuaciones y gráficas'],
  ['communication', 'Expresión escrita'],
  ['mathematics', 'Geometría espacial: paralelepípedos rectangulares'],
  ['mathematics', 'Razonamiento matemático y suficiencia de datos'],
  ['practice', 'Simulacro global final'],
]

export type SavedDayProgress = { videosCompleted?: number; completedVideoIndexes?: number[]; exercisesCompleted?: number; completedExerciseIndexes?: number[] }
export type SavedProgress = Record<number, SavedDayProgress>

export const INTRO_PLAYLIST_ID = 'PLeySRPnY35dF1DoKO_5VyboxzdT4UyyPA'
export const DAY_ONE_VIDEO_IDS = [
  'v4h6KZkQ1Q0', 'lTpbx63UK6M', 'VvvtknaN0j0', 'ASvBBYxDhE0',
  'WS5rtL9tTpU', 'Ld4gka7goSg', 'jdqwzCL_PG0', 'UbqjPCAjUfg',
  '1aJTsc11Czs', '29Z-cRvi7RQ', 'x2VWk-AwN9w', 'zfX5Jz_ZtZI',
  'Z_tC5AuqKSI', 'o-m0eRWfsxI', 'Yn8pLJWADD4', 'tFxkvmq9zAs',
] as const

export function createStudyDays(saved: SavedProgress): StudyDay[] {
  const days = curriculum.map(([course, title], index) => {
    const day = index + 1
    const isPractice = course === 'practice'
    const totalVideos = isPractice ? 0 : day === 1 ? 16 : 3
    const totalExercises = isPractice ? 0 : 20
    const progress = saved[day] || { videosCompleted: 0, exercisesCompleted: 0 }
    const completedVideoIndexes = progress.completedVideoIndexes
      ? [...new Set(progress.completedVideoIndexes.filter((videoIndex) => Number.isInteger(videoIndex) && videoIndex >= 0 && videoIndex < totalVideos))]
      : Array.from({ length: Math.min(totalVideos, Math.max(0, progress.videosCompleted || 0)) }, (_, videoIndex) => videoIndex)
    const videosCompleted = completedVideoIndexes.length
    const completedExerciseIndexes = progress.completedExerciseIndexes
      ? [...new Set(progress.completedExerciseIndexes.filter((exerciseIndex) => Number.isInteger(exerciseIndex) && exerciseIndex >= 0 && exerciseIndex < totalExercises))]
      : Array.from({ length: Math.min(totalExercises, Math.max(0, progress.exercisesCompleted || 0)) }, (_, exerciseIndex) => exerciseIndex)
    const exercisesCompleted = completedExerciseIndexes.length
    const percent = isPractice
      ? (progress.exercisesCompleted ? 100 : 0)
      : Math.min(100, Math.round((videosCompleted / totalVideos) * 60 + (exercisesCompleted / totalExercises) * 40))
    return { id: day, day, course, title, videosCompleted, completedVideoIndexes, exercisesCompleted, completedExerciseIndexes, totalVideos, totalExercises, progress: percent, status: 'locked' as DayStatus }
  })

  let unlocked = true
  return days.map((day, index) => {
    const status: DayStatus = !unlocked
      ? 'locked'
      : day.progress >= 100
        ? 'completed'
        : day.progress > 0
          ? 'in_progress'
          : 'available'
    unlocked = unlocked && (day.course === 'practice' ? day.progress >= 100 : day.videosCompleted === day.totalVideos)
    if (index === days.length - 1) return { ...day, status }
    return { ...day, status }
  })
}

export function courseLabel(course: Course) {
  if (course === 'mathematics') return 'Matemática'
  if (course === 'communication') return 'Comunicación'
  return 'Práctica global'
}
