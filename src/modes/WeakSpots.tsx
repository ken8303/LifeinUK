import { useMemo } from 'react'
import { BY_ID, TEST_LENGTH } from '../lib/data'
import { useApp, useDispatch, makeRun } from '../lib/store'
import { bookmarkedIds, isWeak, statFor, weakQuestionIds } from '../lib/stats'
import { makeT } from '../lib/i18n'
import { pct, relative } from '../lib/format'
import { Runner } from '../components/Runner'
import { Button, Card, Empty, IconStar, Pill, SectionTitle, StatTile } from '../components/ui'

export function WeakSpots() {
  const { run, stats, settings } = useApp()
  const dispatch = useDispatch()
  const t = makeT(settings.lang)

  const starred = useMemo(() => bookmarkedIds(stats), [stats])
  const struggling = useMemo(
    () => weakQuestionIds(stats).filter((id) => !statFor(stats, id).bookmarked),
    [stats],
  )
  const deck = useMemo(() => [...starred, ...struggling], [starred, struggling])

  if (run && run.kind === 'weak') {
    return (
      <Runner
        run={run}
        onExit={() => dispatch({ type: 'exit' })}
        exitLabel="Back to Weak Spots"
        subtitle="Weak spots"
      />
    )
  }

  function startDeck(ids: string[], label: string) {
    if (!ids.length) return
    const take = ids.slice(0, Math.max(TEST_LENGTH, Math.min(ids.length, 40)))
    dispatch({ type: 'start', run: makeRun('weak', label, take) })
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="eyebrow mb-1">{t('weak')}</div>
        <h1 className="font-display text-[28px] leading-tight text-ink">{t('weakTitle')}</h1>
        <p className="mt-2 text-[14px] text-muted max-w-[62ch]">{t('weakIntro')}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label={t('savedByYou')} value={starred.length} tone="accent" sub={t('starredWhilePractising')} />
        <StatTile label={t('flaggedByTracker')} value={struggling.length} tone={struggling.length ? 'bad' : 'good'} sub={t('lowAccOrMiss')} />
        <StatTile label={t('deckSize')} value={deck.length} sub={t('questionsToDrill')} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          size="lg"
          disabled={!deck.length}
          onClick={() => startDeck(deck, `Weak spots · ${Math.min(deck.length, 40)} questions`)}
        >
          {t('drillWholeDeck')}
        </Button>
        <Button
          variant="secondary"
          disabled={!starred.length}
          onClick={() => startDeck(starred, `Saved questions · ${starred.length}`)}
        >
          {t('onlySaved')}
        </Button>
        <Button
          variant="secondary"
          disabled={!struggling.length}
          onClick={() => startDeck(struggling, `Struggling · ${struggling.length}`)}
        >
          {t('onlyMissed')}
        </Button>
      </div>

      {deck.length === 0 ? (
        <Empty
          title={t('nothingHereYet')}
          body={t('nothingHereBody')}
          action={
            <Button variant="secondary" onClick={() => dispatch({ type: 'mode', mode: 'practice' })}>
              {t('goToPractice')}
            </Button>
          }
        />
      ) : (
        <Card>
          <SectionTitle eyebrow={t('nQuestions', { n: deck.length })} title={t('whatsInDeck')} />
          <ul className="flex flex-col">
            {deck.map((id) => {
              const q = BY_ID[id]
              const st = statFor(stats, id)
              const acc = st.attempts ? st.correct / st.attempts : null
              return (
                <li
                  key={id}
                  className="flex items-start gap-4 py-3 border-b border-[var(--line)] last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'bookmark', qid: id })}
                    aria-pressed={st.bookmarked}
                    title={st.bookmarked ? 'Remove from saved' : 'Save this question'}
                    className={`mt-[2px] shrink-0 ${
                      st.bookmarked ? 'text-[var(--warn)]' : 'text-[var(--faint)] hover:text-[var(--warn)]'
                    }`}
                  >
                    <IconStar filled={st.bookmarked} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] text-[var(--ink)] leading-snug">{q.question}</div>
                    <div className="font-mono text-[10.5px] text-[var(--faint)] mt-1">
                      Test {q.exam_id} · {q.topic}
                      {st.lastSeen
                        ? ` · ${settings.lang === 'zh' ? '最後一次' : 'last seen'} ${relative(st.lastSeen, settings.lang)}`
                        : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {st.bookmarked ? <Pill tone="warn">{t('savedPill')}</Pill> : null}
                    {isWeak(st) ? <Pill tone="bad">{t('strugglingPill')}</Pill> : null}
                    <span className="tnum font-mono text-[12px] text-[var(--muted)] w-[86px] text-right">
                      {acc === null ? t('unseen') : `${pct(acc)} · ${st.attempts}×`}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
