import { BY_EXAM, EXAM_IDS, TOTAL_QUESTIONS } from '../lib/data'
import { useApp, useDispatch, makeRun } from '../lib/store'
import { isMastered, statFor } from '../lib/stats'
import { makeT } from '../lib/i18n'
import { pct } from '../lib/format'
import { Runner } from '../components/Runner'
import { Button, Meter, SectionTitle } from '../components/ui'

export function Practice() {
  const { run, stats, settings } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)

  if (run && run.kind === 'practice') {
    return (
      <Runner run={run} onExit={() => dispatch({ type: 'exit' })} exitLabel="Back to tests" subtitle="Practice" />
    )
  }

  function open(id: number) {
    dispatch({
      type: 'start',
      run: makeRun('practice', `Practice test ${id}`, BY_EXAM[id].map((q) => q.id), { examId: id }),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="eyebrow mb-1">{t('practice')}</div>
        <h1 className="font-display text-[28px] leading-tight text-ink">{t('practiceTitle')}</h1>
        <p className="mt-2 text-[14px] text-muted max-w-[62ch]">{t('practiceIntro')}</p>
      </header>

      <SectionTitle
        eyebrow={t('testsAndQuestions', { t: EXAM_IDS.length, q: TOTAL_QUESTIONS })}
        title={t('chooseTest')}
      />

      <ul className="grid grid-cols-3 gap-3">
        {EXAM_IDS.map((id) => {
          const qs = BY_EXAM[id]
          const seen = qs.filter((q) => statFor(stats, q.id).attempts > 0).length
          const mastered = qs.filter((q) => isMastered(statFor(stats, q.id))).length
          const attempts = qs.reduce((n, q) => n + statFor(stats, q.id).attempts, 0)
          const correct = qs.reduce((n, q) => n + statFor(stats, q.id).correct, 0)
          const acc = attempts ? correct / attempts : null

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => open(id)}
                className="w-full text-left bg-surface border border-line rounded-[3px] p-4 transition-colors hover:border-[var(--accent)] hover:bg-accent-wash"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[19px] text-ink">{t('testN', { n: id })}</span>
                  <span className="tnum font-mono text-[11.5px] text-muted">
                    {acc === null ? t('notStarted') : t('pctCorrect', { p: pct(acc) })}
                  </span>
                </div>
                <div className="mt-3">
                  <Meter
                    value={mastered / qs.length}
                    tone={mastered === qs.length ? 'good' : 'accent'}
                    height={5}
                  />
                </div>
                <div className="mt-2 tnum font-mono text-[11px] text-faint flex justify-between">
                  <span>{t('attempted', { a: seen, b: qs.length })}</span>
                  <span>{t('masteredCount', { n: mastered })}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="pt-1">
        <Button
          variant="secondary"
          onClick={() =>
            open(
              EXAM_IDS.find((id) => BY_EXAM[id].some((q) => !isMastered(statFor(stats, q.id)))) ??
                EXAM_IDS[0],
            )
          }
        >
          {t('continueWhereLeft')}
        </Button>
      </div>
    </div>
  )
}
