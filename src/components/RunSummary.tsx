import { useMemo, useState } from 'react'
import type { Run } from '../lib/types'
import { BY_ID, PASS_MARK, TEST_LENGTH } from '../lib/data'
import { useApp, useDispatch, isCorrect, makeRun } from '../lib/store'
import { duration, pct } from '../lib/format'
import { QuestionCard } from './QuestionCard'
import { Button, Card, IconArrow, IconCheck, IconCross, Pill, StatTile } from './ui'

export function RunSummary({ run, onExit }: { run: Run; onExit: () => void }) {
  const { stats } = useApp()
  const dispatch = useDispatch()
  const [filter, setFilter] = useState<'missed' | 'all' | 'flagged'>('missed')

  const official = run.kind === 'official'
  const total = run.questionIds.length
  const passThreshold = Math.round((PASS_MARK / TEST_LENGTH) * total)

  const results = useMemo(
    () =>
      run.questionIds.map((id) => {
        const a = run.answers[id]
        const attempted = (a?.selected.length ?? 0) > 0
        return { id, answer: a, attempted, right: attempted && isCorrect(id, a.selected) }
      }),
    [run],
  )

  const score = results.filter((r) => r.right).length
  const missed = results.filter((r) => !r.right)
  const flagged = results.filter((r) => r.answer?.flagged)
  const unanswered = results.filter((r) => !r.attempted).length
  const passed = score >= passThreshold
  const elapsed = run.submittedAt ? (run.submittedAt - run.startedAt) / 1000 : 0

  const shown =
    filter === 'missed' ? missed : filter === 'flagged' ? flagged : results

  function retryMissed() {
    const ids = missed.map((r) => r.id)
    if (!ids.length) return
    dispatch({
      type: 'start',
      run: makeRun('weak', `Retry · ${ids.length} missed`, ids),
    })
    // The retry deck is a 'weak' run, so the view has to follow it there —
    // otherwise Practice/Official render their own kind and the deck vanishes.
    dispatch({ type: 'mode', mode: 'weak' })
  }

  const topics = useMemo(() => {
    const map = new Map<string, { right: number; total: number }>()
    for (const r of results) {
      const t = BY_ID[r.id]?.topic ?? 'Other'
      const cur = map.get(t) ?? { right: 0, total: 0 }
      cur.total += 1
      if (r.right) cur.right += 1
      map.set(t, cur)
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [results])

  return (
    <div className="flex flex-col gap-5">
      {official ? (
        <div
          className={`rounded-[3px] border-l-[5px] border px-6 py-5 flex items-center justify-between gap-6 flex-wrap ${
            passed
              ? 'bg-[var(--good-wash)] border-[var(--good-line)] border-l-[var(--good)]'
              : 'bg-[var(--bad-wash)] border-[var(--bad-line)] border-l-[var(--bad)]'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={passed ? 'text-[var(--good)]' : 'text-[var(--bad)]'}>
              {passed ? <IconCheck size={30} /> : <IconCross size={30} />}
            </span>
            <div>
              <div
                className={`font-display text-[30px] leading-none ${
                  passed ? 'text-[var(--good)]' : 'text-[var(--bad)]'
                }`}
              >
                {passed ? 'Pass' : 'Not this time'}
              </div>
              <p className="text-[13px] text-[var(--ink-2)] mt-1.5">
                You scored <strong className="tnum">{score} out of {total}</strong> ({pct(score / total)}).
                The pass mark is {passThreshold} out of {total} — 75%.
              </p>
            </div>
          </div>
          <div className="tnum font-mono text-[13px] text-[var(--ink-2)] text-right">
            <div>
              {duration(elapsed)} used
              {run.endsAt ? ` of ${duration((run.endsAt - run.startedAt) / 1000)}` : ''}
            </div>
            <div className="text-[var(--muted)]">
              {duration(elapsed / Math.max(1, total))} per question
            </div>
          </div>
        </div>
      ) : (
        <header>
          <div className="eyebrow mb-1">Run complete</div>
          <h1 className="font-display text-[27px] leading-tight text-[var(--ink)]">{run.label}</h1>
        </header>
      )}

      <div className="grid grid-cols-4 gap-3">
        <StatTile
          label="Score"
          value={score}
          suffix={`/ ${total}`}
          tone={passed ? 'good' : 'bad'}
          sub={pct(score / total)}
        />
        <StatTile
          label="Answered wrong"
          value={missed.length - unanswered}
          tone={missed.length - unanswered > 0 ? 'bad' : 'good'}
          sub={unanswered ? `plus ${unanswered} left blank` : 'nothing left blank'}
        />
        <StatTile label="Time taken" value={duration(elapsed)} sub={`${duration(elapsed / Math.max(1, total))} per question`} />
        <StatTile label="Flagged" value={flagged.length} sub="Marked for review during the run" />
      </div>

      <Card>
        <div className="eyebrow mb-3">How each area went</div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5">
          {topics.map(([topic, v]) => {
            const acc = v.right / v.total
            return (
              <li key={topic} className="flex items-center gap-3">
                <span className="text-[13px] text-[var(--ink)] flex-1 min-w-0 truncate">{topic}</span>
                <span className="tnum font-mono text-[12px] text-[var(--muted)] whitespace-nowrap">
                  {v.right}/{v.total}
                </span>
                <span className="w-[86px] h-[6px] rounded-[1px] bg-[var(--surface-3)] overflow-hidden shrink-0">
                  <span
                    className="block h-full rounded-[1px]"
                    style={{
                      width: `${acc * 100}%`,
                      background:
                        acc >= 0.75 ? 'var(--good)' : acc >= 0.5 ? 'var(--warn)' : 'var(--bad)',
                    }}
                  />
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="primary" onClick={onExit}>
          <IconArrow size={14} /> Back to {official ? 'test setup' : 'the list'}
        </Button>
        {missed.length > unanswered ? (
          <Button variant="secondary" onClick={retryMissed}>
            Retry the {missed.length} you missed
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-1 border border-[var(--line)] rounded-[2px] p-[3px] bg-[var(--surface)]">
          {(
            [
              ['missed', `Missed (${missed.length})`],
              ['flagged', `Flagged (${flagged.length})`],
              ['all', `All (${total})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-[2px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
                filter === key
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <Card>
          <p className="text-[14px] text-[var(--ink-2)] flex items-center gap-2">
            <span className="text-[var(--good)]">
              <IconCheck />
            </span>
            {filter === 'missed'
              ? 'Nothing missed — a clean sweep.'
              : 'Nothing flagged during this run.'}
          </p>
        </Card>
      ) : (
        <ol className="flex flex-col gap-4">
          {shown.map((r) => {
            const q = BY_ID[r.id]
            const idx = run.questionIds.indexOf(r.id)
            return (
              <li key={r.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="eyebrow tnum">Question {idx + 1}</span>
                  {r.right ? (
                    <Pill tone="good" icon={<IconCheck size={12} />}>Correct</Pill>
                  ) : r.attempted ? (
                    <Pill tone="bad" icon={<IconCross size={12} />}>Incorrect</Pill>
                  ) : (
                    <Pill tone="warn">Not answered</Pill>
                  )}
                  {r.answer?.flagged ? <Pill tone="warn">Flagged</Pill> : null}
                </div>
                <QuestionCard
                  question={q}
                  answer={r.answer}
                  mode="review"
                  number={idx + 1}
                  total={total}
                  bookmarked={!!stats[r.id]?.bookmarked}
                  onSelect={() => {}}
                  onBookmark={() => dispatch({ type: 'bookmark', qid: r.id })}
                />
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
