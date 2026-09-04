import { QUESTIONS, TEST_LENGTH } from '../lib/data'
import { useApp, useDispatch, makeRun } from '../lib/store'
import { sampleAdaptive } from '../lib/sampling'
import { overview } from '../lib/stats'
import { makeT } from '../lib/i18n'
import { Runner } from '../components/Runner'
import { Button, StatTile } from '../components/ui'

export function Adaptive() {
  const { run, stats, settings } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)

  if (run && (run.kind === 'adaptive' || run.kind === 'weak')) {
    return (
      <Runner
        run={run}
        onExit={() => dispatch({ type: 'exit' })}
        exitLabel="Leave run"
        subtitle={run.kind === 'weak' ? 'Weak spots' : 'Adaptive mock'}
      />
    )
  }

  const o = overview(stats)

  function start() {
    const picked = sampleAdaptive(QUESTIONS, TEST_LENGTH, stats, settings)
    dispatch({
      type: 'start',
      run: makeRun('adaptive', `Adaptive mock · ${TEST_LENGTH} questions`, picked.map((q) => q.id)),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="eyebrow mb-1">{t('adaptive')}</div>
        <h1 className="font-display text-[28px] leading-tight text-ink">{t('adaptiveTitle')}</h1>
        <p className="mt-2 text-[14px] text-muted max-w-[62ch]">{t('adaptiveIntro')}</p>
      </header>

      <div>
        <Button variant="primary" size="lg" onClick={start}>
          {t('startRun', { n: TEST_LENGTH })}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatTile label={t('questionsSeen')} value={o.seen} suffix={`/ ${QUESTIONS.length}`} />
        <StatTile label={t('masteredLabel')} value={o.mastered} tone="accent" />
        <StatTile label={t('stillShakyTile')} value={o.weak} tone={o.weak ? 'bad' : 'good'} />
        <StatTile label={t('neverAttemptedTile')} value={o.unseen} />
      </div>
    </div>
  )
}
