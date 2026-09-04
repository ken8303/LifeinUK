import raw from '../questions.json'
import type { Question } from './types'

export const QUESTIONS = raw as Question[]

export const BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
)

export const EXAM_IDS: number[] = [...new Set(QUESTIONS.map((q) => q.exam_id))].sort(
  (a, b) => a - b,
)

export const BY_EXAM: Record<number, Question[]> = Object.fromEntries(
  EXAM_IDS.map((id) => [id, QUESTIONS.filter((q) => q.exam_id === id)]),
)

export const TOPICS: string[] = [
  'Values & Principles',
  'What is the UK?',
  'A Long & Illustrious History',
  'A Modern, Thriving Society',
  'Government, Law & Your Role',
]

export const TOTAL_QUESTIONS = QUESTIONS.length
export const TEST_LENGTH = 24
export const PASS_MARK = 18
export const OFFICIAL_SECONDS = 45 * 60
export const LOW_TIME_SECONDS = 5 * 60

export function getQuestion(id: string): Question {
  return BY_ID[id]
}

/** Key used to stop the same question text appearing twice in one run. */
export function dedupeKey(q: Question): string {
  return q.dup_group ?? q.id
}
