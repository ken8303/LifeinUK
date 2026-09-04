import type { Question, QStat, StatMap, Settings } from './types'
import { dedupeKey } from './data'

/**
 * Adaptive sampling engine.
 *
 * Selection weight for question i is the Cauchy (Lorentzian) density evaluated
 * at that question's accuracy rate r_i:
 *
 *        P(q_i)  ∝  1 / ( γ · ( 1 + ((r_i − x₀) / γ)² ) )
 *
 * The density peaks at r = x₀ (default 0 — never answered correctly) and decays
 * with a heavy tail, so a question you have never got right is roughly nine
 * times as likely to be drawn as one you always get right, while a mastered
 * question keeps a small but strictly non-zero chance of coming back.
 */

/** Laplace-style smoothing so an unseen question has a sensible prior rate. */
export const PRIOR_STRENGTH = 1.5
export const PRIOR_MEAN = 0.55

export const DEFAULT_SETTINGS: Settings = {
  gamma: 0.35,
  x0: 0,
  showExplanations: true,
  timerSeconds: 45 * 60,
  lang: 'zh',
  v: 2,
}

export function smoothedAccuracy(st?: QStat): number {
  const attempts = st?.attempts ?? 0
  const correct = st?.correct ?? 0
  return (correct + PRIOR_STRENGTH * PRIOR_MEAN) / (attempts + PRIOR_STRENGTH)
}

export function cauchyWeight(r: number, gamma: number, x0: number): number {
  const z = (r - x0) / gamma
  return 1 / (gamma * (1 + z * z))
}

/** Recent errors matter more than old ones — driven by the last 3 attempts. */
export function recencyFactor(st?: QStat): number {
  const last3 = (st?.history ?? []).slice(-3)
  if (last3.length === 0) return 1
  const errors = last3.filter((v) => v === 0).length
  return 1 + 0.6 * (errors / last3.length)
}

/** Just-answered questions are damped so a run does not feel repetitive. */
export function cooldownFactor(st: QStat | undefined, now: number): number {
  if (!st?.lastSeen) return 1
  const minutes = (now - st.lastSeen) / 60000
  if (minutes >= 60) return 1
  return 0.35 + 0.65 * (minutes / 60)
}

/** Manually starred questions are pulled forward. */
export function bookmarkFactor(st?: QStat): number {
  return st?.bookmarked ? 1.5 : 1
}

export interface WeightBreakdown {
  id: string
  rate: number
  base: number
  recency: number
  cooldown: number
  bookmark: number
  weight: number
  probability: number
}

export function weighQuestions(
  pool: Question[],
  stats: StatMap,
  settings: Settings,
  now = Date.now(),
): WeightBreakdown[] {
  const rows = pool.map((q) => {
    const st = stats[q.id]
    const rate = smoothedAccuracy(st)
    const base = cauchyWeight(rate, settings.gamma, settings.x0)
    const recency = recencyFactor(st)
    const cooldown = cooldownFactor(st, now)
    const bookmark = bookmarkFactor(st)
    return {
      id: q.id,
      rate,
      base,
      recency,
      cooldown,
      bookmark,
      weight: base * recency * cooldown * bookmark,
      probability: 0,
    }
  })
  const total = rows.reduce((sum, r) => sum + r.weight, 0) || 1
  for (const r of rows) r.probability = r.weight / total
  return rows
}

/**
 * Weighted sampling without replacement (Efraimidis–Spirakis): draw a key
 * −ln(U)/w for each item and keep the smallest n. Duplicate question texts are
 * collapsed so one run never asks the same thing twice.
 */
export function sampleAdaptive(
  pool: Question[],
  n: number,
  stats: StatMap,
  settings: Settings,
  now = Date.now(),
): Question[] {
  const weights = new Map(weighQuestions(pool, stats, settings, now).map((r) => [r.id, r.weight]))
  const keyed = pool.map((q) => {
    const w = Math.max(weights.get(q.id) ?? 1e-9, 1e-9)
    const u = Math.random() || 1e-12
    return { q, key: -Math.log(u) / w }
  })
  keyed.sort((a, b) => a.key - b.key)

  const picked: Question[] = []
  const seen = new Set<string>()
  for (const { q } of keyed) {
    const k = dedupeKey(q)
    if (seen.has(k)) continue
    seen.add(k)
    picked.push(q)
    if (picked.length === n) break
  }
  return picked
}

/** Plain uniform draw, deduped — used by the "random" official test option. */
export function sampleRandom(pool: Question[], n: number): Question[] {
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const picked: Question[] = []
  const seen = new Set<string>()
  for (const q of shuffled) {
    const k = dedupeKey(q)
    if (seen.has(k)) continue
    seen.add(k)
    picked.push(q)
    if (picked.length === n) break
  }
  return picked
}
