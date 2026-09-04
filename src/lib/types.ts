export type QuestionType = 'single' | 'multi' | 'boolean' | 'statement'

export interface Question {
  id: string
  exam_id: number
  question: string
  options: string[]
  /** Index of the (first) correct option — kept for schema compatibility. */
  correct_index: number
  /** All correct option indices. Length > 1 for "choose TWO answers". */
  correct_indices: number[]
  multi: boolean
  type: QuestionType
  topic: string
  explanation: string
  /** Traditional Chinese (繁體中文) rendering, shown when the 中文 toggle is on. */
  question_zh: string
  options_zh: string[]
  explanation_zh: string
  /** Present when the same question text appears in more than one exam. */
  dup_group?: string
}

/** Per-question performance record. Persisted. */
export interface QStat {
  attempts: number
  correct: number
  incorrect: number
  /** Newest last, capped at HISTORY_CAP. 1 = correct, 0 = incorrect. */
  history: number[]
  lastSeen: number | null
  bookmarked: boolean
}

export type StatMap = Record<string, QStat>

export type Mode = 'dashboard' | 'practice' | 'adaptive' | 'official' | 'analytics' | 'weak'

/** A completed run, kept for trend charts. */
export interface SessionResult {
  id: string
  kind: 'practice' | 'adaptive' | 'official' | 'weak'
  label: string
  finishedAt: number
  score: number
  total: number
  /** Seconds spent. */
  elapsed: number
  passed: boolean
  questionIds: string[]
}

/** An answer inside a live run. */
export interface RunAnswer {
  selected: number[]
  /** Locked runs (official test) only score on submit. */
  revealed: boolean
  correct: boolean | null
  flagged: boolean
  /** ms spent on this question */
  time: number
}

export type RunKind = 'practice' | 'adaptive' | 'official' | 'weak'

export interface Run {
  kind: RunKind
  label: string
  questionIds: string[]
  answers: Record<string, RunAnswer>
  index: number
  startedAt: number
  /** Wall-clock deadline for timed runs, so a refresh cannot buy extra time. */
  endsAt: number | null
  submittedAt: number | null
  /** practice mode only: which exam is open */
  examId?: number
}

export interface Settings {
  gamma: number
  x0: number
  showExplanations: boolean
  timerSeconds: number
  /** Interface language. Questions, answers and run controls are always English. */
  lang: 'en' | 'zh'
  /** Settings schema version, used to roll out new defaults. */
  v?: number
}
