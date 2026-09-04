import type { ReactNode } from 'react'
import type { Mode } from '../lib/types'
import { useApp, useDispatch } from '../lib/store'
import { makeT, type UIKey } from '../lib/i18n'
import { overview } from '../lib/stats'
import { TOTAL_QUESTIONS } from '../lib/data'
import { pct } from '../lib/format'
import { Meter } from './ui'

interface NavItem {
  key: Mode
  label: UIKey
  note: UIKey
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'overview', note: 'overviewNote' },
  { key: 'practice', label: 'practice', note: 'practiceNote' },
  { key: 'adaptive', label: 'adaptive', note: 'adaptiveNote' },
  { key: 'official', label: 'official', note: 'officialNote' },
  { key: 'weak', label: 'weak', note: 'weakNote' },
  { key: 'analytics', label: 'stats', note: 'statsNote' },
]

export function Shell({ children }: { children: ReactNode }) {
  const { mode, stats, run, settings } = useApp()
  const dispatch = useDispatch()
  const o = overview(stats)
  const t = makeT(settings.lang)

  // The exam chrome runs edge to edge, like the terminal at the test centre.
  const bleed = mode === 'official' && run?.kind === 'official' && !run.submittedAt

  const runMode: Mode | null = run
    ? run.kind === 'official'
      ? 'official'
      : run.kind === 'practice'
        ? 'practice'
        : run.kind === 'weak'
          ? 'weak'
          : 'adaptive'
    : null

  return (
    <div className={`min-h-screen flex bg-[var(--paper)] app-shell ${bleed ? 'exam-mode' : ''}`}>
      <aside className="desktop-sidebar w-[248px] shrink-0 border-r border-[var(--line)] bg-[var(--surface)] flex flex-col sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <Crest />
            <div className="leading-tight">
              <div className="font-display text-[16px] text-ink">Life in the UK</div>
              <div className="eyebrow">Trainer</div>
            </div>
          </div>

          <div
            className="mt-4 flex items-center gap-1 border border-line rounded-[2px] p-[3px]"
            role="group"
            aria-label="Language"
          >
            {(
              [
                ['en', 'English'],
                ['zh', '繁體中文'],
              ] as const
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => dispatch({ type: 'settings', settings: { lang: code } })}
                aria-pressed={settings.lang === code}
                className={`flex-1 rounded-[2px] px-2 py-1 text-[12px] font-semibold transition-colors ${
                  code === 'zh' ? 'zh' : ''
                } ${
                  settings.lang === code
                    ? 'bg-btn text-btn-ink'
                    : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto" aria-label="Sections">
          <ul>
            {NAV.map((item) => {
              const active = mode === item.key
              const hasRun = runMode === item.key
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'mode', mode: item.key })}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full text-left pl-4 pr-3 py-2.5 border-l-[3px] transition-colors ${
                      active
                        ? 'border-l-[var(--accent)] bg-[var(--accent-wash)]'
                        : 'border-l-transparent hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13.5px] font-semibold ${
                          settings.lang === 'zh' ? 'zh' : ''
                        } ${active ? 'text-accent' : 'text-ink'}`}
                      >
                        {t(item.label)}
                      </span>
                      {hasRun ? (
                        <span
                          className="w-[6px] h-[6px] rounded-full bg-[var(--warn)] shrink-0"
                          title={t('runInProgress')}
                          aria-label={t('runInProgress')}
                        />
                      ) : null}
                    </div>
                    <div
                      className={`text-[11.5px] text-muted mt-[1px] ${
                        settings.lang === 'zh' ? 'zh' : ''
                      }`}
                    >
                      {t(item.note)}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-5 py-4 border-t border-[var(--line)]">
          <div className={`eyebrow mb-1.5 ${settings.lang === 'zh' ? 'zh' : ''}`}>
            {t('masteredLabel')}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display text-[22px] text-[var(--ink)] tnum leading-none">
              {pct(o.masteryRate, 1)}
            </span>
            <span className="text-[11.5px] text-[var(--muted)] tnum">
              {o.mastered}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <Meter value={o.masteryRate} tone={o.masteryRate >= 0.8 ? 'good' : 'accent'} height={5} />
          <p className="text-[10.5px] text-faint mt-3 leading-snug">{t('storedLocally')}</p>
        </div>
      </aside>

      <div className="mobile-header">
        <div className="mobile-brand">
          <Crest />
          <div className="leading-tight">
            <div className="font-display text-[18px] text-ink">Life in the UK</div>
            <div className="eyebrow">Trainer</div>
          </div>
        </div>
        <div className="mobile-language" role="group" aria-label="Language">
          {(['en', 'zh'] as const).map((code) => (
            <button key={code} type="button" onClick={() => dispatch({ type: 'settings', settings: { lang: code } })}
              aria-pressed={settings.lang === code} className={settings.lang === code ? 'active' : ''}>
              {code === 'en' ? 'EN' : '中'}
            </button>
          ))}
        </div>
      </div>
      <main className="flex-1 min-w-0 app-main">
        {bleed ? children : <div className="max-w-[1120px] mx-auto px-8 py-8 mobile-main-inner">{children}</div>}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Sections">
        {NAV.map((item) => {
          const active = mode === item.key
          return (
            <button key={item.key} type="button" onClick={() => dispatch({ type: 'mode', mode: item.key })}
              aria-current={active ? 'page' : undefined} className={active ? 'active' : ''}>
              <span className={settings.lang === 'zh' ? 'zh' : ''}>{t(item.label)}</span>
              {runMode === item.key ? <span className="mobile-run-dot" /> : null}
            </button>
          )
        })}
      </nav>

    </div>
  )
}

/** A small quartered crest — four nations, one mark. */
function Crest() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <rect x="0.75" y="0.75" width="28.5" height="28.5" rx="2" fill="var(--accent)" />
      <path d="M0.75 0.75 L29.25 29.25 M29.25 0.75 L0.75 29.25" stroke="var(--surface)" strokeWidth="2.4" opacity="0.55" />
      <rect x="12.4" y="0.75" width="5.2" height="28.5" fill="var(--surface)" opacity="0.9" />
      <rect x="0.75" y="12.4" width="28.5" height="5.2" fill="var(--surface)" opacity="0.9" />
      <rect x="13.6" y="0.75" width="2.8" height="28.5" fill="var(--accent)" />
      <rect x="0.75" y="13.6" width="28.5" height="2.8" fill="var(--accent)" />
    </svg>
  )
}
