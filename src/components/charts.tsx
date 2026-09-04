import { useState } from 'react'
import type { StatMap, SessionResult } from '../lib/types'
import { BY_EXAM, EXAM_IDS, TEST_LENGTH, PASS_MARK } from '../lib/data'
import { heatBucket, statFor, HEAT_LABELS, type GroupStat } from '../lib/stats'
import { pct } from '../lib/format'

const HEAT_VARS = [
  'var(--heat-0)',
  'var(--heat-1)',
  'var(--heat-2)',
  'var(--heat-3)',
  'var(--heat-4)',
  'var(--heat-5)',
]

interface HoverCell {
  x: number
  y: number
  title: string
  lines: string[]
}

/**
 * Failure heatmap: one cell per question, laid out as 17 practice tests × 24
 * questions. Sequential single-hue ramp on error rate — pale means clean, deep
 * means repeatedly wrong. Never-attempted questions sit off the ramp entirely.
 */
export function FailureHeatmap({
  stats,
  onPick,
  testLabel = (n) => `Test ${n}`,
  labels,
}: {
  stats: StatMap
  onPick?: (id: string) => void
  testLabel?: (n: number) => string
  labels?: { fewer: string; more: string; notAttempted: string; saved: string }
}) {
  const L = labels ?? {
    fewer: 'Fewer errors',
    more: 'More errors',
    notAttempted: 'Not attempted',
    saved: 'Saved to Weak Spots',
  }
  const [hover, setHover] = useState<HoverCell | null>(null)

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-[3px] -m-[3px]">
          <tbody>
            {EXAM_IDS.map((examId) => (
              <tr key={examId}>
                <th
                  scope="row"
                  className="pr-2 text-right align-middle font-mono text-[10.5px] font-medium text-[var(--faint)] whitespace-nowrap tnum"
                >
                  {testLabel(examId)}
                </th>
                {BY_EXAM[examId].map((q, i) => {
                  const st = statFor(stats, q.id)
                  const bucket = heatBucket(st)
                  const acc = st.attempts ? st.correct / st.attempts : null
                  return (
                    <td key={q.id} className="p-0">
                      <button
                        type="button"
                        onClick={() => onPick?.(q.id)}
                        onMouseEnter={(e) => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          const host = (e.currentTarget.closest('.relative') as HTMLElement) ?? null
                          const hr = host?.getBoundingClientRect()
                          setHover({
                            x: r.left - (hr?.left ?? 0) + r.width / 2,
                            y: r.top - (hr?.top ?? 0),
                            title: `Test ${examId} · Q${i + 1}`,
                            lines: [
                              q.question.length > 74 ? `${q.question.slice(0, 74)}…` : q.question,
                              st.attempts
                                ? `${st.correct}/${st.attempts} correct · ${pct(acc ?? 0)}`
                                : 'Not attempted yet',
                              st.bookmarked ? 'Saved to Weak Spots' : '',
                            ].filter(Boolean),
                          })
                        }}
                        onMouseLeave={() => setHover(null)}
                        aria-label={`Test ${examId} question ${i + 1}: ${HEAT_LABELS[bucket]}`}
                        className="block w-[13px] h-[13px] rounded-[2px] border transition-transform duration-75 hover:scale-[1.45] focus-visible:scale-[1.45]"
                        style={{
                          background: HEAT_VARS[bucket],
                          borderColor:
                            bucket === 0 ? 'var(--line)' : 'transparent',
                          borderStyle: bucket === 0 ? 'dashed' : 'solid',
                          boxShadow: st.bookmarked ? 'inset 0 0 0 1.5px var(--warn)' : undefined,
                        }}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hover ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <div className="bg-[var(--ink)] text-[var(--surface)] rounded-[3px] px-3 py-2 shadow-lg max-w-[320px]">
            <div className="font-mono text-[10.5px] tracking-[0.08em] uppercase opacity-70">
              {hover.title}
            </div>
            {hover.lines.map((l, i) => (
              <div key={i} className={i === 0 ? 'text-[12.5px] leading-snug mt-1' : 'text-[11.5px] opacity-80 mt-0.5 tnum'}>
                {l}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--muted)]">{L.fewer}</span>
          {HEAT_VARS.slice(1).map((v, i) => (
            <span
              key={i}
              title={HEAT_LABELS[i + 1]}
              className="w-[15px] h-[11px] rounded-[1px] border border-[var(--line)]"
              style={{ background: v }}
            />
          ))}
          <span className="text-[11px] text-[var(--muted)]">{L.more}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span
            className="w-[11px] h-[11px] rounded-[2px] border border-dashed border-[var(--line-strong)]"
            style={{ background: 'var(--heat-0)' }}
          />
          {L.notAttempted}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span
            className="w-[11px] h-[11px] rounded-[2px]"
            style={{ background: 'var(--heat-2)', boxShadow: 'inset 0 0 0 1.5px var(--warn)' }}
          />
          {L.saved}
        </div>
      </div>
    </div>
  )
}

/** Score trend across mock runs. Single series: no legend, endpoint emphasised. */
export function ScoreTrend({
  sessions,
  emptyNote,
}: {
  sessions: SessionResult[]
  emptyNote?: string
}) {
  const data = sessions.slice(-14)
  const w = 560
  const h = 150
  const padL = 30
  const padR = 14
  const padT = 12
  const padB = 24

  if (data.length < 2) {
    return (
      <div className="text-[13px] text-[var(--muted)] py-6 text-center border border-dashed border-[var(--line)] rounded-[3px]">
        {emptyNote ?? 'Finish two mock tests and your score trend appears here.'}
      </div>
    )
  }

  const max = TEST_LENGTH
  const x = (i: number) => padL + (i * (w - padL - padR)) / (data.length - 1)
  const y = (v: number) => padT + (1 - v / max) * (h - padT - padB)

  const line = data.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s.score).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`
  const last = data[data.length - 1]

  return (
    <figure className="m-0">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img"
             aria-label={`Mock test scores across the last ${data.length} runs, out of ${TEST_LENGTH}.`}>
          {[0, 6, 12, 18, 24].map((v) => (
            <g key={v}>
              <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
              <text x={padL - 6} y={y(v) + 3.5} textAnchor="end"
                    className="tnum" fontSize="10" fill="var(--faint)" fontFamily="var(--font-mono)">
                {v}
              </text>
            </g>
          ))}
          <line x1={padL} x2={w - padR} y1={y(PASS_MARK)} y2={y(PASS_MARK)}
                stroke="var(--good)" strokeWidth="1.25" strokeDasharray="4 3" />
          <text x={w - padR} y={y(PASS_MARK) - 5} textAnchor="end" fontSize="10"
                fill="var(--good)" fontFamily="var(--font-mono)" letterSpacing="0.06em">
            PASS 18
          </text>

          <path d={area} fill="var(--accent)" opacity="0.10" />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" />

          {data.map((s, i) => (
            <circle key={s.id} cx={x(i)} cy={y(s.score)} r={i === data.length - 1 ? 5 : 3.4}
                    fill={i === data.length - 1 ? 'var(--accent)' : 'var(--surface)'}
                    stroke="var(--accent)" strokeWidth="2">
              <title>{`${new Date(s.finishedAt).toLocaleDateString('en-GB')} — ${s.score}/${s.total}`}</title>
            </circle>
          ))}

          <text x={x(data.length - 1)} y={y(last.score) - 12} textAnchor="end"
                className="tnum" fontSize="12" fontWeight="700" fill="var(--accent)"
                fontFamily="var(--font-mono)">
            {last.score}/{last.total}
          </text>
        </svg>
      </div>
      <figcaption className="text-[11.5px] text-[var(--muted)] mt-1">
        Last {data.length} mock runs, oldest first. The dashed line is the 18/24 pass mark.
      </figcaption>
    </figure>
  )
}

/** Horizontal accuracy bars, one per group. Single hue, direct-labelled. */
export function GroupBars({
  rows,
  emptyNote,
  seenWord = 'seen',
}: {
  rows: GroupStat[]
  emptyNote: string
  seenWord?: string
}) {
  const anySeen = rows.some((r) => r.attempts > 0)
  if (!anySeen) {
    return <div className="text-[13px] text-[var(--muted)] py-4">{emptyNote}</div>
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => {
        const acc = r.accuracy
        const tone = acc === null ? 'accent' : acc >= 0.75 ? 'good' : acc >= 0.5 ? 'warn' : 'bad'
        const colour = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)', accent: 'var(--line-strong)' }[tone]
        return (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-[13px] text-[var(--ink)]">{r.label}</span>
              <span className="tnum text-[12px] text-[var(--muted)] font-mono whitespace-nowrap">
                {acc === null ? '—' : pct(acc)}
                <span className="text-[var(--faint)]">
                  {' '}
                  · {r.seen}/{r.total} {seenWord}
                </span>
              </span>
            </div>
            <div className="w-full h-[8px] rounded-[1px] bg-[var(--surface-3)] overflow-hidden">
              <div
                style={{
                  width: `${(acc ?? 0) * 100}%`,
                  height: '100%',
                  background: colour,
                  borderRadius: '1px',
                  transition: 'width 240ms ease-out',
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
