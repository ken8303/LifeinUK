import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { Mode, Run, RunAnswer, RunKind, SessionResult, Settings, StatMap } from './types'
import { BY_ID, PASS_MARK, TEST_LENGTH } from './data'
import { EMPTY_STAT, recordAnswer, statFor } from './stats'
import { DEFAULT_SETTINGS } from './sampling'
import { load, save, saveNow, clearAll } from './storage'

export interface AppState {
  mode: Mode
  stats: StatMap
  sessions: SessionResult[]
  settings: Settings
  run: Run | null
}

export type Action =
  | { type: 'mode'; mode: Mode }
  | { type: 'start'; run: Run }
  | { type: 'exit' }
  | { type: 'goto'; index: number }
  | { type: 'select'; qid: string; selected: number[] }
  | { type: 'check'; qid: string }
  | { type: 'flag'; qid: string }
  | { type: 'bookmark'; qid: string }
  | { type: 'submit' }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'reset' }

export const emptyAnswer = (): RunAnswer => ({
  selected: [],
  revealed: false,
  correct: null,
  flagged: false,
  time: 0,
})

export function makeRun(
  kind: RunKind,
  label: string,
  questionIds: string[],
  opts: { endsAt?: number | null; examId?: number } = {},
): Run {
  return {
    kind,
    label,
    questionIds,
    answers: Object.fromEntries(questionIds.map((id) => [id, emptyAnswer()])),
    index: 0,
    startedAt: Date.now(),
    endsAt: opts.endsAt ?? null,
    submittedAt: null,
    examId: opts.examId,
  }
}

export function isCorrect(qid: string, selected: number[]): boolean {
  const q = BY_ID[qid]
  if (!q || selected.length === 0) return false
  const want = [...q.correct_indices].sort((a, b) => a - b).join(',')
  const got = [...selected].sort((a, b) => a - b).join(',')
  return want === got
}

/** An answer is complete once the required number of options is chosen. */
export function isComplete(qid: string, selected: number[]): boolean {
  const q = BY_ID[qid]
  return !!q && selected.length === q.correct_indices.length
}

function scoreRun(run: Run): number {
  return run.questionIds.filter((id) => isCorrect(id, run.answers[id]?.selected ?? [])).length
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'mode':
      return { ...state, mode: action.mode }

    case 'start':
      return { ...state, run: action.run }

    case 'exit':
      return { ...state, run: null }

    case 'goto': {
      if (!state.run) return state
      const index = Math.max(0, Math.min(action.index, state.run.questionIds.length - 1))
      return { ...state, run: { ...state.run, index } }
    }

    case 'select': {
      const run = state.run
      if (!run || run.submittedAt) return state
      const prev = run.answers[action.qid] ?? emptyAnswer()
      if (prev.revealed) return state

      // Selecting never commits — nothing is marked until 'check' (or, in the
      // official test, until the whole paper is submitted).
      const next: RunAnswer = {
        ...prev,
        selected: action.selected,
        time: Date.now() - run.startedAt,
      }

      return {
        ...state,
        run: { ...run, answers: { ...run.answers, [action.qid]: next } },
      }
    }

    case 'check': {
      const run = state.run
      if (!run || run.submittedAt || run.kind === 'official') return state
      const prev = run.answers[action.qid]
      if (!prev || prev.revealed || !isComplete(action.qid, prev.selected)) return state

      const correct = isCorrect(action.qid, prev.selected)
      const stats = {
        ...state.stats,
        [action.qid]: recordAnswer(statFor(state.stats, action.qid), correct),
      }

      return {
        ...state,
        stats,
        run: {
          ...run,
          answers: { ...run.answers, [action.qid]: { ...prev, revealed: true, correct } },
        },
      }
    }

    case 'flag': {
      const run = state.run
      if (!run) return state
      const prev = run.answers[action.qid] ?? emptyAnswer()
      return {
        ...state,
        run: {
          ...run,
          answers: { ...run.answers, [action.qid]: { ...prev, flagged: !prev.flagged } },
        },
      }
    }

    case 'bookmark': {
      const st = statFor(state.stats, action.qid)
      return {
        ...state,
        stats: { ...state.stats, [action.qid]: { ...st, bookmarked: !st.bookmarked } },
      }
    }

    case 'submit': {
      const run = state.run
      if (!run || run.submittedAt) return state

      // Locked runs bank every answer at once, on submit.
      let stats = state.stats
      if (run.kind === 'official') {
        for (const id of run.questionIds) {
          const answer = run.answers[id]
          if (!answer || answer.selected.length === 0) continue
          stats = { ...stats, [id]: recordAnswer(statFor(stats, id), isCorrect(id, answer.selected)) }
        }
      }

      const submittedAt = Date.now()
      const score = scoreRun(run)
      const answers = Object.fromEntries(
        run.questionIds.map((id) => {
          const a = run.answers[id] ?? emptyAnswer()
          return [id, { ...a, revealed: true, correct: isCorrect(id, a.selected) }]
        }),
      )

      const session: SessionResult = {
        id: `s_${submittedAt}`,
        kind: run.kind,
        label: run.label,
        finishedAt: submittedAt,
        score,
        total: run.questionIds.length,
        elapsed: Math.round((submittedAt - run.startedAt) / 1000),
        passed: score >= Math.round((PASS_MARK / TEST_LENGTH) * run.questionIds.length),
        questionIds: run.questionIds,
      }

      return {
        ...state,
        stats,
        sessions: [...state.sessions, session].slice(-60),
        run: { ...run, answers, submittedAt, index: 0 },
      }
    }

    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.settings, v: 2 } }

    case 'reset':
      clearAll()
      return {
        mode: 'dashboard',
        stats: {},
        sessions: [],
        settings: DEFAULT_SETTINGS,
        run: null,
      }

    default:
      return state
  }
}

function initial(): AppState {
  const run = load<Run | null>('run', null)
  const stored = load<Partial<Settings>>('settings', {})
  const settings: Settings = { ...DEFAULT_SETTINGS, ...stored }

  // Settings saved before v2 predate the Chinese interface, so they carry the
  // old 'en' default. Roll them on to the new default once; a deliberate
  // choice made after that is stamped v2 and left alone.
  if (stored.v !== 2) {
    settings.lang = DEFAULT_SETTINGS.lang
    settings.v = 2
  }

  return {
    mode: load<Mode>('mode', 'dashboard'),
    stats: load<StatMap>('stats', {}),
    sessions: load<SessionResult[]>('sessions', []),
    settings,
    run: run && run.questionIds?.length ? run : null,
  }
}

const StateCtx = createContext<AppState | null>(null)
const DispatchCtx = createContext<Dispatch<Action> | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)

  useEffect(() => save('stats', state.stats), [state.stats])
  useEffect(() => save('sessions', state.sessions), [state.sessions])
  useEffect(() => save('settings', state.settings), [state.settings])
  useEffect(() => save('mode', state.mode), [state.mode])
  useEffect(() => save('run', state.run, 120), [state.run])

  // Flush the in-flight debounce if the tab is closed or hidden mid-answer.
  useEffect(() => {
    const flush = () => {
      saveNow('stats', state.stats)
      saveNow('run', state.run)
      saveNow('sessions', state.sessions)
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [state.stats, state.run, state.sessions])

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useApp(): AppState {
  const ctx = useContext(StateCtx)
  if (!ctx) throw new Error('useApp must be used inside StoreProvider')
  return ctx
}

export function useDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchCtx)
  if (!ctx) throw new Error('useDispatch must be used inside StoreProvider')
  return ctx
}

export function useStat(qid: string) {
  const { stats } = useApp()
  return useMemo(() => stats[qid] ?? EMPTY_STAT, [stats, qid])
}
