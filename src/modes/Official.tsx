import { useCallback, useEffect, useMemo, useState } from 'react'
import { BY_ID, LOW_TIME_SECONDS, OFFICIAL_SECONDS, PASS_MARK, QUESTIONS, TEST_LENGTH } from '../lib/data'
import { useApp, useDispatch, makeRun } from '../lib/store'
import { sampleAdaptive, sampleRandom } from '../lib/sampling'
import { makeT } from '../lib/i18n'
import { useKeyboard } from '../lib/keyboard'
import { useTicker } from '../lib/hooks'
import { clock } from '../lib/format'
import { QuestionCard } from '../components/QuestionCard'
import { RunSummary } from '../components/RunSummary'
import { Button, Card, IconArrow, IconClock, IconFlag, IconGrid, Kbd, SectionTitle } from '../components/ui'

export function Official() {
  const { run } = useApp()
  const live = run && run.kind === 'official'
  if (!live) return <Setup />
  if (run.submittedAt) return <Results run={run} />
  return <Exam />
}

/* ------------------------------------------------------------------ setup */

function Setup() {
  const { stats, settings, sessions } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)
  const [source, setSource] = useState<'adaptive' | 'random'>('adaptive')

  const history = sessions.filter((s) => s.kind === 'official').slice(-5).reverse()

  function start() {
    const picked =
      source === 'adaptive'
        ? sampleAdaptive(QUESTIONS, TEST_LENGTH, stats, settings)
        : sampleRandom(QUESTIONS, TEST_LENGTH)
    dispatch({
      type: 'start',
      run: makeRun('official', 'Official simulation', picked.map((q) => q.id), {
        endsAt: Date.now() + OFFICIAL_SECONDS * 1000,
      }),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="eyebrow mb-1">{t('official')}</div>
        <h1 className="font-display text-[28px] leading-tight text-ink">{t('officialTitle')}</h1>
        <p className="mt-2 text-[14px] text-muted max-w-[62ch]">{t('officialIntro')}</p>
      </header>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 items-start">
        <Card>
          <SectionTitle eyebrow={t('beforeBegin')} title={t('rulesTitle')} />
          <ul className="flex flex-col gap-2.5 text-[13.5px] text-ink-2">
            {[
              [t('rule24'), t('rule24Note')],
              [t('rule45'), t('rule45Note')],
              [t('rule18'), t('rule18Note')],
              [t('ruleNoFb'), t('ruleNoFbNote')],
              [t('ruleFlag'), t('ruleFlagNote')],
            ].map(([term, note]) => (
              <li key={term} className="flex gap-3">
                <span className="w-[128px] shrink-0 font-semibold text-ink">{term}</span>
                <span className="text-muted">{note}</span>
              </li>
            ))}
          </ul>

          <hr className="rule my-4" />

          <div className="eyebrow mb-2">{t('questionSelection')}</div>
          <div className="flex gap-2">
            {(
              [
                ['adaptive', t('selAdaptive'), t('selAdaptiveNote')],
                ['random', t('selRandom'), t('selRandomNote')],
              ] as [ 'adaptive' | 'random', string, string ][]
            ).map(([key, label, note]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSource(key)}
                className={`flex-1 text-left rounded-[2px] border px-3.5 py-3 transition-colors ${
                  source === key
                    ? 'border-[var(--accent)] bg-[var(--accent-wash)]'
                    : 'border-[var(--line)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="text-[13.5px] font-semibold text-ink">{label}</div>
                <div className="text-[11.5px] text-muted mt-0.5">{note}</div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <Button variant="primary" size="lg" onClick={start}>
              <IconClock size={16} /> {t('beginTest')}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow={t('yourRecord')} title={t('recentOfficial')} />
          {history.length === 0 ? (
            <p className="text-[13px] text-muted">{t('noOfficialYet')}</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {history.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--line)] last:border-0 pb-2 last:pb-0"
                >
                  <span className="text-[12.5px] text-[var(--muted)] tnum font-mono">
                    {new Date(s.finishedAt).toLocaleDateString(
                      settings.lang === 'zh' ? 'zh-Hant' : 'en-GB',
                      { day: '2-digit', month: 'short' },
                    )}
                  </span>
                  <span
                    className={`tnum font-mono text-[13px] font-semibold ${
                      s.passed ? 'text-[var(--good)]' : 'text-[var(--bad)]'
                    }`}
                  >
                    {s.score}/{s.total}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- exam */

function Exam() {
  const { run, stats, settings } = useApp()
  const t = makeT(settings.lang)
  const dispatch = useDispatch()
  const [showGrid, setShowGrid] = useState(false)
  const [confirm, setConfirm] = useState(false)
  useTicker(true, 250)

  const total = run!.questionIds.length
  const qid = run!.questionIds[run!.index]
  const question = BY_ID[qid]
  const answer = run!.answers[qid]

  const remaining = run!.endsAt ? Math.max(0, (run!.endsAt - Date.now()) / 1000) : 0
  const low = remaining <= LOW_TIME_SECONDS
  const answeredCount = run!.questionIds.filter((id) => run!.answers[id]?.selected.length).length
  const flaggedCount = run!.questionIds.filter((id) => run!.answers[id]?.flagged).length

  // Time is up: submit whatever is on the paper.
  useEffect(() => {
    if (remaining <= 0 && !run!.submittedAt) dispatch({ type: 'submit' })
  }, [remaining, run, dispatch])

  const go = useCallback((i: number) => dispatch({ type: 'goto', index: i }), [dispatch])

  const keymap = useMemo(
    () => ({
      onOption: (i: number) => {
        if (!question || i >= question.options.length) return
        const need = question.correct_indices.length
        const cur = answer?.selected ?? []
        const nextSel =
          need === 1
            ? [i]
            : cur.includes(i)
              ? cur.filter((x) => x !== i)
              : cur.length < need
                ? [...cur, i]
                : [...cur.slice(1), i]
        dispatch({ type: 'select', qid, selected: nextSel })
      },
      onNext: () => go(Math.min(total - 1, run!.index + 1)),
      onPrev: () => go(Math.max(0, run!.index - 1)),
      onFlag: () => dispatch({ type: 'flag', qid }),
      onReview: () => setShowGrid(true),
      onEscape: () => {
        setShowGrid(false)
        setConfirm(false)
      },
      enabled: !confirm,
    }),
    [question, answer, qid, dispatch, go, run, total, confirm],
  )
  useKeyboard(keymap)

  if (!question) return null

  return (
    <div className="min-h-screen flex flex-col exam-page">
      {/* chrome: deliberately plainer than the rest of the app */}
      <div className="bg-[var(--exam-chrome)] border-b border-[var(--exam-line)] px-8 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--exam-ink)]">
            Life in the UK Test
          </span>
          <span className="text-[12px] text-[var(--muted)]">{t('simulatedSitting')}</span>
        </div>
        <div
          className={`flex items-center gap-2 font-mono tnum text-[17px] font-semibold px-3 py-1 rounded-[2px] border ${
            low
              ? 'text-[var(--bad)] border-[var(--bad-line)] bg-[var(--bad-wash)]'
              : 'text-[var(--exam-ink)] border-[var(--exam-line)] bg-[var(--exam-body)]'
          }`}
          role="timer"
          aria-live={low ? 'polite' : 'off'}
        >
          <span className={low ? 'low-time' : undefined}>
            <IconClock size={16} />
          </span>
          {clock(remaining)}
        </div>
      </div>

      {low ? (
        <div className="bg-[var(--bad-wash)] border-b border-[var(--bad-line)] px-8 py-2 text-[12.5px] text-[var(--bad)] font-medium">
          {t('underFiveMinutes')}
        </div>
      ) : null}

      <div className="bg-[var(--exam-bar)] border-b border-[var(--exam-line)] px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[12.5px] text-[var(--exam-ink)]">
          <span className="tnum font-mono font-semibold">
            {t('questionOf', { n: run!.index + 1, total })}
          </span>
          <span className="text-[var(--muted)] tnum">{answeredCount} {t('answered')}</span>
          <span className="text-[var(--muted)] tnum flex items-center gap-1">
            <IconFlag size={12} /> {flaggedCount} {t('flaggedForReview')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowGrid(true)}>
            <IconGrid size={14} /> {t('reviewAll')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setConfirm(true)}>
            {t('submitTest')}
          </Button>
        </div>
      </div>

      <div className="exam-content px-8 py-6 bg-[var(--paper)] flex-1">
        <div className="max-w-[860px] mx-auto flex flex-col gap-4">
          <QuestionCard
            question={question}
            answer={answer}
            mode="locked"
            number={run!.index + 1}
            total={total}
            bookmarked={!!stats[qid]?.bookmarked}
            onSelect={(selected) => dispatch({ type: 'select', qid, selected })}
            onFlag={() => dispatch({ type: 'flag', qid })}
            register="exam"
          />

          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => go(run!.index - 1)} disabled={run!.index === 0}>
              <IconArrow dir="left" size={14} /> {t('previous')}
            </Button>
            <span className="text-[11.5px] text-[var(--muted)] flex items-center gap-2">
              <Kbd>1</Kbd>–<Kbd>4</Kbd> answer · <Kbd>F</Kbd> flag · <Kbd>R</Kbd> review · <Kbd>Enter</Kbd> next
            </span>
            <Button
              variant="primary"
              onClick={() => (run!.index === total - 1 ? setShowGrid(true) : go(run!.index + 1))}
            >
              {run!.index === total - 1 ? t('reviewAnswers') : t('next')} <IconArrow size={14} />
            </Button>
          </div>
        </div>
      </div>

      {showGrid ? (
        <ReviewGrid
          onClose={() => setShowGrid(false)}
          onPick={(i) => {
            go(i)
            setShowGrid(false)
          }}
          onSubmit={() => {
            setShowGrid(false)
            setConfirm(true)
          }}
        />
      ) : null}

      {confirm ? (
        <ConfirmSubmit
          answered={answeredCount}
          total={total}
          flagged={flaggedCount}
          onCancel={() => setConfirm(false)}
          onConfirm={() => dispatch({ type: 'submit' })}
        />
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------- review + confirm */

function ReviewGrid({
  onClose,
  onPick,
  onSubmit,
}: {
  onClose: () => void
  onPick: (i: number) => void
  onSubmit: () => void
}) {
  const { run, settings } = useApp()
  const t = makeT(settings.lang)
  const ids = run!.questionIds
  const answered = ids.filter((id) => run!.answers[id]?.selected.length).length
  const flagged = ids.filter((id) => run!.answers[id]?.flagged).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(11_18_32/0.6)] px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Review all questions"
      onClick={onClose}
    >
      <div
        className="bg-[var(--exam-body)] border border-[var(--exam-line)] rounded-[3px] w-full max-w-[640px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--exam-chrome)] border-b border-[var(--exam-line)] px-5 py-3">
          <h2 className={`text-[15px] font-semibold text-[var(--exam-ink)] ${settings.lang === 'zh' ? 'zh' : ''}`}>{t('questionSummary')}</h2>
          <p className="text-[12px] text-[var(--muted)] mt-0.5 tnum">
            {answered} {t('answered')} · {flagged} {t('flaggedForReview')} · {ids.length - answered} {t('leftBlank')}
          </p>
        </div>

        <div className="p-5">
          <ol className="grid grid-cols-8 gap-2">
            {ids.map((id, i) => {
              const a = run!.answers[id]
              const done = (a?.selected.length ?? 0) > 0
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onPick(i)}
                    className={`tnum relative w-full aspect-square rounded-[2px] border font-mono text-[12px] font-semibold transition-colors ${
                      done
                        ? 'border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent)]'
                        : 'border-[var(--exam-line)] bg-[var(--exam-body)] text-[var(--muted)] hover:bg-[var(--surface-2)]'
                    }`}
                    aria-label={`Question ${i + 1}, ${done ? 'answered' : 'not answered'}${a?.flagged ? ', flagged' : ''}`}
                  >
                    {i + 1}
                    {a?.flagged ? (
                      <span
                        aria-hidden="true"
                        className="absolute -top-[5px] -right-[5px] text-[var(--warn)] bg-[var(--exam-body)] rounded-full"
                      >
                        <IconFlag size={13} filled />
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="flex items-center gap-4 mt-4 text-[11.5px] text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] border border-[var(--accent)] bg-[var(--accent-wash)]" />
              Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] border border-[var(--exam-line)]" />
              Not answered
            </span>
            <span className="flex items-center gap-1.5 text-[var(--warn)]">
              <IconFlag size={13} filled /> Flagged for review
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--exam-line)] px-5 py-3.5 flex justify-between gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t('backToPaper')}
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            {t('submitTest')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmSubmit({
  answered,
  total,
  flagged,
  onCancel,
  onConfirm,
}: {
  answered: number
  total: number
  flagged: number
  onCancel: () => void
  onConfirm: () => void
}) {
  const { settings } = useApp()
  const t = makeT(settings.lang)
  const blank = total - answered
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(11_18_32/0.6)] px-6"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--line)] rounded-[3px] p-6 max-w-[440px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`font-display text-[21px] text-[var(--ink)] ${settings.lang === 'zh' ? 'zh' : ''}`}>{t('submitYourTest')}</h2>
        <p className="mt-2 text-[13.5px] text-[var(--muted)]">
          {blank > 0
            ? (settings.lang === 'zh'
                ? `${blank} 題仍未作答，提交後會計為錯誤。`
                : `${blank} question${blank === 1 ? ' is' : 's are'} still blank and will be marked wrong.`)
            : t('allAnswered')}
          {flagged > 0 ? (settings.lang === 'zh' ? ` 仍有 ${flagged} 題已標記待覆核。` : ` You still have ${flagged} flagged for review.`) : ''}
          {' '}{settings.lang === 'zh' ? '提交後不能再修改答案。' : 'You cannot change anything once the paper is submitted.'}
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onCancel}>
            {t('keepWorking')}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t('submitAndMark')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- results */

function Results({ run }: { run: NonNullable<ReturnType<typeof useApp>['run']> }) {
  const dispatch = useDispatch()
  const { sessions } = useApp()
  const officials = sessions.filter((s) => s.kind === 'official')
  const best = officials.reduce((m, s) => Math.max(m, s.score), 0)

  return (
    <div className="flex flex-col gap-5">
      <RunSummary run={run} onExit={() => dispatch({ type: 'exit' })} />
      {officials.length > 1 ? (
        <Card>
          <SectionTitle eyebrow="Across your sittings" title="Official attempts so far" />
          <div className="flex gap-8 text-[13px] text-[var(--ink-2)]">
            <span>
              Attempts <strong className="tnum">{officials.length}</strong>
            </span>
            <span>
              Passed{' '}
              <strong className="tnum">
                {officials.filter((s) => s.passed).length}
              </strong>
            </span>
            <span>
              Best score <strong className="tnum">{best}/{TEST_LENGTH}</strong>
            </span>
            <span className="text-[var(--muted)]">Pass mark {PASS_MARK}/{TEST_LENGTH}</span>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
