import { useCallback, useMemo, useState } from 'react'
import type { Run } from '../lib/types'
import { BY_ID } from '../lib/data'
import { useApp, useDispatch, isCorrect, isComplete } from '../lib/store'
import { useKeyboard } from '../lib/keyboard'
import { QuestionCard } from './QuestionCard'
import { RunSummary } from './RunSummary'
import { Button, IconArrow, Kbd, Meter } from './ui'

/**
 * The instant-feedback flow shared by Practice, Adaptive Mock and Weak Spots.
 * Answers reveal immediately; navigation stays free in both directions.
 */
export function Runner({
  run,
  onExit,
  exitLabel = 'Leave',
  subtitle,
}: {
  run: Run
  onExit: () => void
  exitLabel?: string
  subtitle?: string
}) {
  const { stats, settings } = useApp()
  const dispatch = useDispatch()
  const [confirmFinish, setConfirmFinish] = useState(false)

  const total = run.questionIds.length
  const qid = run.questionIds[run.index]
  const question = BY_ID[qid]
  const answer = run.answers[qid]

  const answered = run.questionIds.filter((id) => run.answers[id]?.revealed).length
  const score = run.questionIds.filter(
    (id) => run.answers[id]?.revealed && isCorrect(id, run.answers[id].selected),
  ).length

  const go = useCallback((i: number) => dispatch({ type: 'goto', index: i }), [dispatch])

  const ready = !!answer && !answer.revealed && isComplete(qid, answer.selected)

  const advance = useCallback(() => {
    if (run.index < total - 1) go(run.index + 1)
    else if (answered === total) dispatch({ type: 'submit' })
  }, [run.index, total, answered, go, dispatch])

  /** Enter checks the answer first, then moves on. Nothing commits on click. */
  const next = useCallback(() => {
    if (ready) dispatch({ type: 'check', qid })
    else advance()
  }, [ready, dispatch, qid, advance])

  const keymap = useMemo(
    () => ({
      onOption: (i: number) => {
        if (!question || answer?.revealed) return
        if (i >= question.options.length) return
        const need = question.correct_indices.length
        if (need === 1) {
          dispatch({ type: 'select', qid, selected: [i] })
        } else {
          const cur = answer?.selected ?? []
          const nextSel = cur.includes(i)
            ? cur.filter((x) => x !== i)
            : cur.length < need
              ? [...cur, i]
              : [...cur.slice(1), i]
          dispatch({ type: 'select', qid, selected: nextSel })
        }
      },
      onNext: next,
      onPrev: () => go(Math.max(0, run.index - 1)),
      onBookmark: () => dispatch({ type: 'bookmark', qid }),
      enabled: !run.submittedAt,
    }),
    [question, answer, qid, dispatch, next, go, run.index, run.submittedAt],
  )

  useKeyboard(keymap)

  if (run.submittedAt) {
    return <RunSummary run={run} onExit={onExit} />
  }

  if (!question) return null

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="eyebrow mb-1">{subtitle ?? 'Practice'}</div>
          <h1 className="font-display text-[26px] leading-tight text-[var(--ink)]">{run.label}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="tnum font-mono text-[12.5px] text-muted">
            {score}/{answered} correct
          </span>
          <Button variant="ghost" size="sm" onClick={onExit}>
            {exitLabel}
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-3">
        <Meter value={answered / total} tone="accent" height={4} />
        <span className="tnum font-mono text-[11.5px] text-[var(--muted)] whitespace-nowrap">
          {answered}/{total}
        </span>
      </div>

      <QuestionCard
        question={question}
        answer={answer}
        mode="instant"
        number={run.index + 1}
        total={total}
        bookmarked={!!stats[qid]?.bookmarked}
        onSelect={(selected) => dispatch({ type: 'select', qid, selected })}
        onBookmark={() => dispatch({ type: 'bookmark', qid })}
        showExplanation={settings.showExplanations}
      />

      <nav className="flex items-center justify-between gap-4">
        <Button variant="secondary" onClick={() => go(run.index - 1)} disabled={run.index === 0}>
          <IconArrow dir="left" size={14} /> Previous
        </Button>

        <ol className="flex flex-wrap items-center justify-center gap-[3px] max-w-[720px]">
          {run.questionIds.map((id, i) => {
            const a = run.answers[id]
            const done = a?.revealed
            const right = done && isCorrect(id, a.selected)
            const current = i === run.index
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Question ${i + 1}${done ? (right ? ', correct' : ', incorrect') : ', not answered'}`}
                  aria-current={current ? 'true' : undefined}
                  className={`tnum w-[24px] h-[24px] rounded-[2px] border font-mono text-[10.5px] font-semibold transition-colors ${
                    current ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--paper)]' : ''
                  } ${
                    !done
                      ? 'border-[var(--line-strong)] text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                      : right
                        ? 'border-[var(--good-line)] bg-[var(--good-wash)] text-[var(--good)]'
                        : 'border-[var(--bad-line)] bg-[var(--bad-wash)] text-[var(--bad)]'
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            )
          })}
        </ol>

        {!answer?.revealed ? (
          <Button variant="primary" onClick={() => dispatch({ type: 'check', qid })} disabled={!ready}>
            Submit answer
          </Button>
        ) : run.index === total - 1 ? (
          <Button
            variant="primary"
            onClick={() => (answered === total ? dispatch({ type: 'submit' }) : setConfirmFinish(true))}
          >
            Finish and review <IconArrow size={14} />
          </Button>
        ) : (
          <Button variant="primary" onClick={advance}>
            Next <IconArrow size={14} />
          </Button>
        )}
      </nav>

      <div className="flex items-center gap-4 text-[11.5px] text-[var(--muted)] pt-1">
        <span className="flex items-center gap-1.5">
          <Kbd>1</Kbd>–<Kbd>4</Kbd> or <Kbd>A</Kbd>–<Kbd>D</Kbd> choose
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Enter</Kbd> submit, then next
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>←</Kbd> <Kbd>→</Kbd> move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Shift</Kbd>+<Kbd>B</Kbd> save to Weak Spots
        </span>
      </div>

      {confirmFinish ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(11_18_32/0.55)] px-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmFinish(false)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--line)] rounded-[3px] p-6 max-w-[420px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-[20px] text-[var(--ink)]">Finish with questions left?</h2>
            <p className="mt-2 text-[13.5px] text-[var(--muted)]">
              {total - answered} of {total} questions are still unanswered. They will be marked as not
              attempted and will not count towards your statistics.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setConfirmFinish(false)}>
                Keep going
              </Button>
              <Button variant="primary" onClick={() => dispatch({ type: 'submit' })}>
                Finish now
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
