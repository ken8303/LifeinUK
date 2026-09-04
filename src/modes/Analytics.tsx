import { useMemo, useState } from 'react'
import { QUESTIONS, TOTAL_QUESTIONS } from '../lib/data'
import { useApp, useDispatch } from '../lib/store'
import { byExam, byTopic, overview, statFor, isMastered } from '../lib/stats'
import { makeT, topicLabel } from '../lib/i18n'
import { pct, relative } from '../lib/format'
import { FailureHeatmap, GroupBars, ScoreTrend } from '../components/charts'
import { Button, Card, IconStar, Pill, SectionTitle, StatTile } from '../components/ui'

type SortKey = 'weakest' | 'most' | 'recent'

export function Analytics() {
  const { stats, sessions, settings } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)
  const [sort, setSort] = useState<SortKey>('weakest')
  const [confirmReset, setConfirmReset] = useState(false)

  const o = useMemo(() => overview(stats), [stats])
  const topics = useMemo(
    () => byTopic(stats, (x) => topicLabel(settings.lang, x)),
    [stats, settings.lang],
  )
  const exams = useMemo(
    () => byExam(stats, (n) => t('testN', { n })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats, settings.lang],
  )

  const rows = useMemo(() => {
    const seen = QUESTIONS.map((q) => ({ q, st: statFor(stats, q.id) })).filter(
      (r) => r.st.attempts > 0,
    )
    const sorted = [...seen]
    if (sort === 'weakest') {
      sorted.sort((a, b) => {
        const aa = a.st.correct / a.st.attempts
        const bb = b.st.correct / b.st.attempts
        return aa - bb || b.st.attempts - a.st.attempts
      })
    } else if (sort === 'most') {
      sorted.sort((a, b) => b.st.attempts - a.st.attempts)
    } else {
      sorted.sort((a, b) => (b.st.lastSeen ?? 0) - (a.st.lastSeen ?? 0))
    }
    return sorted.slice(0, 25)
  }, [stats, sort])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="eyebrow mb-1">{t('statsEyebrow')}</div>
        <h1 className="font-display text-[28px] leading-tight text-ink">
          {t('statsTitle', { n: TOTAL_QUESTIONS })}
        </h1>
      </header>

      <div className="grid grid-cols-4 gap-3">
        <StatTile
          label={t('masteredLabel')}
          value={o.mastered}
          suffix={`/ ${TOTAL_QUESTIONS}`}
          tone="accent"
          sub={t('ofTheBank', { p: pct(o.masteryRate, 1) })}
        />
        <StatTile
          label={t('overallAccuracy')}
          value={o.overallAccuracy === null ? '—' : pct(o.overallAccuracy)}
          tone={o.overallAccuracy !== null && o.overallAccuracy >= 0.75 ? 'good' : 'ink'}
          sub={t('answersRecorded', { n: o.totalAttempts })}
        />
        <StatTile label={t('stillStruggling')} value={o.weak} tone={o.weak > 0 ? 'bad' : 'good'} sub={t('wrongRecently')} />
        <StatTile label={t('neverAttemptedTile')} value={o.unseen} sub={t('seenAtLeastOnce', { n: o.seen })} />
      </div>

      <Card>
        <SectionTitle
          eyebrow={t('byErrorRate')}
          title={t('failureHeatmap')}
          action={<span className="text-[11.5px] text-muted">{t('gridNote')}</span>}
        />
        <FailureHeatmap
          stats={stats}
          testLabel={(n) => t('testN', { n })}
          labels={{
            fewer: t('fewerErrors'),
            more: t('moreErrors'),
            notAttempted: t('notAttempted'),
            saved: t('savedToWeak'),
          }}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4 items-start">
        <Card>
          <SectionTitle eyebrow={t('handbookChapters')} title={t('accuracyBySubject')} />
          <GroupBars rows={topics} emptyNote={t('emptyNoteTopics')} seenWord={t('seenWord')} />
        </Card>
        <Card>
          <SectionTitle eyebrow={t('mockResults')} title={t('scoreTrend')} />
          <ScoreTrend
            sessions={sessions.filter((s) => s.kind === 'official' || s.kind === 'adaptive')}
            emptyNote={t('needTwoMocks')}
          />
        </Card>
      </div>

      <Card>
        <SectionTitle eyebrow={t('sourceTests')} title={t('accuracyByTest')} />
        <div className="grid grid-cols-2 gap-x-8">
          <GroupBars rows={exams.slice(0, 9)} emptyNote={t('emptyNoteExams')} seenWord={t('seenWord')} />
          <GroupBars rows={exams.slice(9)} emptyNote={t('emptyNoteExams2')} seenWord={t('seenWord')} />
        </div>
      </Card>

      <Card>
        <SectionTitle
          eyebrow={t('perQuestionDetail')}
          title={t('questionPerformance')}
          action={
            <div className="flex items-center gap-1 border border-[var(--line)] rounded-[2px] p-[3px]">
              {(
                [
                  ['weakest', t('weakest')],
                  ['most', t('mostAnswered')],
                  ['recent', t('mostRecent')],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`rounded-[2px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    sort === key
                      ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />

        {rows.length === 0 ? (
          <p className="text-[13px] text-muted py-3">{t('nothingAnsweredYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left border-b border-[var(--line)]">
                  <th className="eyebrow font-normal pb-2">{t('colQuestion')}</th>
                  <th className="eyebrow font-normal pb-2 text-right w-[86px]">{t('colAsked')}</th>
                  <th className="eyebrow font-normal pb-2 text-right w-[74px]">{t('colWrong')}</th>
                  <th className="eyebrow font-normal pb-2 text-right w-[92px]">{t('colAccuracy')}</th>
                  <th className="eyebrow font-normal pb-2 text-right w-[104px]">{t('colLastSeen')}</th>
                  <th className="eyebrow font-normal pb-2 text-right w-[110px]">{t('colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ q, st }) => {
                  const acc = st.correct / st.attempts
                  return (
                    <tr key={q.id} className="border-b border-[var(--line)] last:border-0 align-top">
                      <td className="py-2.5 pr-4">
                        <div className="text-[var(--ink)] leading-snug">{q.question}</div>
                        <div className="font-mono text-[10.5px] text-[var(--faint)] mt-0.5">
                          {q.id} · Test {q.exam_id} · {q.topic}
                        </div>
                      </td>
                      <td className="py-2.5 text-right tnum font-mono text-[var(--muted)]">{st.attempts}</td>
                      <td className="py-2.5 text-right tnum font-mono text-[var(--muted)]">{st.incorrect}</td>
                      <td
                        className={`py-2.5 text-right tnum font-mono font-semibold ${
                          acc >= 0.75 ? 'text-[var(--good)]' : acc >= 0.5 ? 'text-[var(--warn)]' : 'text-[var(--bad)]'
                        }`}
                      >
                        {pct(acc)}
                      </td>
                      <td className="py-2.5 text-right text-[11.5px] text-[var(--faint)] whitespace-nowrap">
                        {st.lastSeen ? relative(st.lastSeen, settings.lang) : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          {isMastered(st) ? <Pill tone="good">{t('masteredPill')}</Pill> : null}
                          {st.bookmarked ? (
                            <Pill tone="warn" icon={<IconStar size={11} filled />}>
                              {t('savedPill')}
                            </Pill>
                          ) : null}
                          {!isMastered(st) && !st.bookmarked ? (
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'bookmark', qid: q.id })}
                              className="text-[11.5px] text-[var(--muted)] hover:text-[var(--warn)] inline-flex items-center gap-1"
                            >
                              <IconStar size={12} /> {t('savedLabel')}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle eyebrow={t('storedOnDevice')} title={t('yourData')} />
        <p className="text-[13px] text-muted max-w-[62ch]">{t('dataBody')}</p>
        <div className="mt-4">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-bad font-medium">{t('confirmErase')}</span>
              <Button variant="danger" size="sm" onClick={() => dispatch({ type: 'reset' })}>
                {t('yesErase')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                {t('cancel')}
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
              {t('resetProgress')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
