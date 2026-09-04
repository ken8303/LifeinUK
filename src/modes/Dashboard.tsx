import { useMemo } from 'react'
import { QUESTIONS, TOTAL_QUESTIONS, TEST_LENGTH, PASS_MARK } from '../lib/data'
import { useApp, useDispatch, makeRun } from '../lib/store'
import { byTopic, overview, weakQuestionIds } from '../lib/stats'
import { sampleAdaptive } from '../lib/sampling'
import { makeT, topicLabel } from '../lib/i18n'
import { duration, pct, relative } from '../lib/format'
import { GroupBars, ScoreTrend } from '../components/charts'
import { Button, Card, IconArrow, IconClock, Meter, Pill, SectionTitle, StatTile } from '../components/ui'

export function Dashboard() {
  const { stats, sessions, settings, run } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)

  const o = useMemo(() => overview(stats), [stats])
  const topics = useMemo(
    () => byTopic(stats, (x) => topicLabel(settings.lang, x)),
    [stats, settings.lang],
  )
  const weak = useMemo(() => weakQuestionIds(stats), [stats])
  const mocks = sessions.filter((s) => s.kind === 'official' || s.kind === 'adaptive')
  const officials = sessions.filter((s) => s.kind === 'official')
  const lastOfficial = officials[officials.length - 1]

  const ready =
    o.masteryRate >= 0.8 &&
    officials.slice(-2).length === 2 &&
    officials.slice(-2).every((s) => s.passed)

  const steps = [
    { step: t('learnIt'), title: t('practice'), body: t('practiceBody'), target: 'practice' },
    { step: t('drillIt'), title: t('adaptive'), body: t('adaptiveBody'), target: 'adaptive' },
    { step: t('rehearseIt'), title: t('official'), body: t('officialBody'), target: 'official' },
  ] as const

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-8 flex-wrap">
        <div>
          <div className="eyebrow mb-1">{t('dashEyebrow')}</div>
          <h1 className="font-display text-[32px] leading-[1.15] text-ink max-w-[24ch]">
            {t('dashTitle')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {run ? (
            <Button
              variant="primary"
              onClick={() =>
                dispatch({
                  type: 'mode',
                  mode:
                    run.kind === 'official'
                      ? 'official'
                      : run.kind === 'practice'
                        ? 'practice'
                        : run.kind === 'weak'
                          ? 'weak'
                          : 'adaptive',
                })
              }
            >
              {t('resume')} · {run.label} <IconArrow size={14} />
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  const picked = sampleAdaptive(QUESTIONS, TEST_LENGTH, stats, settings)
                  dispatch({
                    type: 'start',
                    run: makeRun('adaptive', `Adaptive mock · ${TEST_LENGTH} questions`, picked.map((q) => q.id)),
                  })
                  dispatch({ type: 'mode', mode: 'adaptive' })
                }}
              >
                {t('startAdaptive')}
              </Button>
              <Button variant="secondary" onClick={() => dispatch({ type: 'mode', mode: 'official' })}>
                <IconClock size={14} /> {t('sitTimed')}
              </Button>
            </>
          )}
        </div>
      </header>

      <Card className="border-l-[4px] border-l-[var(--accent)]">
        <div className="flex items-end justify-between gap-6 mb-3">
          <div>
            <div className="eyebrow">{t('masterRate')}</div>
            <div className="font-display text-[42px] leading-none text-ink tnum mt-1.5">
              {pct(o.masteryRate, 1)}
            </div>
          </div>
          <div className="text-right text-[13px] text-muted tnum">
            <div>
              <strong className="text-ink">{o.mastered}</strong>{' '}
              {t('ofQuestionsMastered', { total: TOTAL_QUESTIONS })}
            </div>
            <div>
              {t('neverAttempted', { n: o.unseen })} · {t('stillShaky', { n: o.weak })}
            </div>
          </div>
        </div>
        <Meter value={o.masteryRate} tone={o.masteryRate >= 0.8 ? 'good' : 'accent'} height={10} />
        <p className="mt-2.5 text-[12px] text-muted">
          {t('masteredDef')}
          {ready ? '' : t('aimFor80')}
        </p>
        {ready ? (
          <div className="mt-3">
            <Pill tone="good">{t('readyBadge')}</Pill>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <StatTile
          label={t('overallAccuracy')}
          value={o.overallAccuracy === null ? '—' : pct(o.overallAccuracy)}
          tone={o.overallAccuracy !== null && o.overallAccuracy >= 0.75 ? 'good' : 'ink'}
          sub={t('answersRecorded', { n: o.totalAttempts })}
        />
        <StatTile
          label={t('lastOfficial')}
          value={lastOfficial ? `${lastOfficial.score}/${lastOfficial.total}` : '—'}
          tone={lastOfficial ? (lastOfficial.passed ? 'good' : 'bad') : 'ink'}
          sub={
            lastOfficial
              ? `${relative(lastOfficial.finishedAt, settings.lang)} · ${duration(lastOfficial.elapsed)}`
              : t('passMark', { a: PASS_MARK, b: TEST_LENGTH })
          }
        />
        <StatTile
          label={t('weakSpotsTile')}
          value={weak.length}
          tone={weak.length > 40 ? 'bad' : 'ink'}
          sub={t('savedOrMissed')}
        />
        <StatTile
          label={t('questionsSeen')}
          value={o.seen}
          suffix={`/ ${TOTAL_QUESTIONS}`}
          sub={t('ofTheBank', { p: pct(o.seen / TOTAL_QUESTIONS) })}
        />
      </div>

      {o.totalAttempts === 0 ? (
        <Card>
          <SectionTitle eyebrow={t('startHere')} title={t('threeWays')} />
          <ol className="grid grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-accent font-semibold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="eyebrow">{s.step}</span>
                </div>
                <div className="font-display text-[17px] text-ink leading-tight">{s.title}</div>
                <p className="text-[12.5px] text-muted leading-[1.6] flex-1">{s.body}</p>
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => dispatch({ type: 'mode', mode: s.target })}
                  >
                    {t('open')} <IconArrow size={13} />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      <Card className="border-l-[4px] border-l-[var(--warn)]">
        <div className="eyebrow mb-1.5">{t('recordRemarkTitle')}</div>
        <p className="text-[13px] text-ink-2 leading-[1.65] max-w-[86ch]">{t('recordRemark')}</p>
        <p className="text-[12.5px] text-muted leading-[1.6] mt-2 max-w-[86ch]">
          {t('desktopOnly')}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 items-start">
        <Card>
          <SectionTitle
            eyebrow={t('handbookChapters')}
            title={t('whereGaps')}
            action={
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'mode', mode: 'analytics' })}>
                {t('fullStats')}
              </Button>
            }
          />
          <GroupBars rows={topics} emptyNote={t('answerFewFirst')} seenWord={t('seenWord')} />
        </Card>

        <Card>
          <SectionTitle eyebrow={t('mockResults')} title={t('scoreTrend')} />
          <ScoreTrend sessions={mocks} emptyNote={t('needTwoMocks')} />
          {sessions.length > 0 ? (
            <ol className="mt-4 flex flex-col gap-1.5">
              {[...sessions].reverse().slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="text-ink truncate">{s.label}</span>
                  <span className="text-faint tnum font-mono whitespace-nowrap">
                    {relative(s.finishedAt, settings.lang)}
                  </span>
                  <span
                    className={`tnum font-mono font-semibold whitespace-nowrap ${
                      s.kind === 'official'
                        ? s.passed
                          ? 'text-good'
                          : 'text-bad'
                        : 'text-muted'
                    }`}
                  >
                    {s.score}/{s.total}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
