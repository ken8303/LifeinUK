import type { QStat, StatMap, SessionResult } from './types'
import { QUESTIONS, TOPICS, EXAM_IDS, BY_EXAM, BY_ID } from './data'

export const HISTORY_CAP = 12

export const EMPTY_STAT: QStat = {
  attempts: 0,
  correct: 0,
  incorrect: 0,
  history: [],
  lastSeen: null,
  bookmarked: false,
}

export function statFor(stats: StatMap, id: string): QStat {
  return stats[id] ?? EMPTY_STAT
}

export function accuracy(st: QStat): number | null {
  return st.attempts === 0 ? null : st.correct / st.attempts
}

/**
 * Mastered = answered at least twice and got the two most recent attempts
 * right. Deliberately requires a repeat, so a lucky guess is not mastery.
 */
export function isMastered(st: QStat): boolean {
  if (st.attempts < 2) return false
  const last2 = st.history.slice(-2)
  return last2.length === 2 && last2.every((v) => v === 1)
}

/** Struggling = seen, and either mostly wrong or wrong most recently. */
export function isWeak(st: QStat): boolean {
  if (st.attempts === 0) return false
  const acc = st.correct / st.attempts
  const lastWrong = st.history[st.history.length - 1] === 0
  return acc < 0.6 || lastWrong
}

export function recordAnswer(st: QStat, correct: boolean, now = Date.now()): QStat {
  const history = [...st.history, correct ? 1 : 0].slice(-HISTORY_CAP)
  return {
    ...st,
    attempts: st.attempts + 1,
    correct: st.correct + (correct ? 1 : 0),
    incorrect: st.incorrect + (correct ? 0 : 1),
    history,
    lastSeen: now,
  }
}

export interface Overview {
  seen: number
  unseen: number
  mastered: number
  weak: number
  bookmarked: number
  totalAttempts: number
  totalCorrect: number
  overallAccuracy: number | null
  masteryRate: number
}

export function overview(stats: StatMap): Overview {
  let seen = 0
  let mastered = 0
  let weak = 0
  let bookmarked = 0
  let totalAttempts = 0
  let totalCorrect = 0
  for (const q of QUESTIONS) {
    const st = statFor(stats, q.id)
    if (st.bookmarked) bookmarked++
    if (st.attempts > 0) {
      seen++
      totalAttempts += st.attempts
      totalCorrect += st.correct
      if (isMastered(st)) mastered++
      else if (isWeak(st)) weak++
    }
  }
  return {
    seen,
    unseen: QUESTIONS.length - seen,
    mastered,
    weak,
    bookmarked,
    totalAttempts,
    totalCorrect,
    overallAccuracy: totalAttempts ? totalCorrect / totalAttempts : null,
    masteryRate: mastered / QUESTIONS.length,
  }
}

export interface GroupStat {
  key: string
  label: string
  total: number
  seen: number
  mastered: number
  attempts: number
  correct: number
  accuracy: number | null
}

function group(label: string, key: string, ids: string[], stats: StatMap): GroupStat {
  let seen = 0
  let mastered = 0
  let attempts = 0
  let correct = 0
  for (const id of ids) {
    const st = statFor(stats, id)
    if (st.attempts > 0) {
      seen++
      attempts += st.attempts
      correct += st.correct
      if (isMastered(st)) mastered++
    }
  }
  return {
    key,
    label,
    total: ids.length,
    seen,
    mastered,
    attempts,
    correct,
    accuracy: attempts ? correct / attempts : null,
  }
}

export function byTopic(stats: StatMap, label: (topic: string) => string = (x) => x): GroupStat[] {
  return TOPICS.map((t) =>
    group(
      label(t),
      t,
      QUESTIONS.filter((q) => q.topic === t).map((q) => q.id),
      stats,
    ),
  )
}

export function byExam(stats: StatMap, label: (id: number) => string = (n) => `Practice test ${n}`): GroupStat[] {
  return EXAM_IDS.map((id) =>
    group(
      label(id),
      String(id),
      BY_EXAM[id].map((q) => q.id),
      stats,
    ),
  )
}

/** 0 = unseen, 1 = clean, 2..5 = increasing error rate. Sequential, one hue. */
export function heatBucket(st: QStat): 0 | 1 | 2 | 3 | 4 | 5 {
  if (st.attempts === 0) return 0
  const errorRate = st.incorrect / st.attempts
  if (errorRate === 0) return 1
  if (errorRate <= 0.25) return 2
  if (errorRate <= 0.5) return 3
  if (errorRate <= 0.75) return 4
  return 5
}

export const HEAT_LABELS = [
  'Not attempted',
  'No errors',
  'Up to 25% wrong',
  '26–50% wrong',
  '51–75% wrong',
  'Over 75% wrong',
]

export function weakQuestionIds(stats: StatMap): string[] {
  return QUESTIONS.filter((q) => {
    const st = statFor(stats, q.id)
    return st.bookmarked || isWeak(st)
  }).map((q) => q.id)
}

export function bookmarkedIds(stats: StatMap): string[] {
  return QUESTIONS.filter((q) => statFor(stats, q.id).bookmarked).map((q) => q.id)
}

export function recentMocks(sessions: SessionResult[], n = 12): SessionResult[] {
  return sessions
    .filter((s) => s.kind === 'official' || s.kind === 'adaptive')
    .slice(-n)
}

export function questionLabel(id: string): string {
  const q = BY_ID[id]
  return q ? `Test ${q.exam_id} · ${q.question}` : id
}
