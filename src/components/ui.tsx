import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-btn text-btn-ink border border-btn hover:bg-btn-hover hover:border-btn-hover',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-2',
  ghost:
    'bg-transparent text-ink-2 border border-transparent hover:bg-surface-2 hover:text-ink',
  danger:
    'bg-transparent text-bad border border-bad-line hover:bg-bad-wash',
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className = '', ...rest }: BtnProps) {
  const sizes = {
    sm: 'px-2.5 py-1 text-[12.5px]',
    md: 'px-3.5 py-1.5 text-[13.5px]',
    lg: 'px-5 py-2.5 text-[15px]',
  }[size]
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded-[2px] font-medium transition-colors duration-100 disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${sizes} ${className}`}
    />
  )
}

export function Card({
  children,
  className = '',
  pad = true,
}: {
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <section
      className={`bg-[var(--surface)] border border-[var(--line)] rounded-[3px] ${pad ? 'p-5' : ''} ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
        <h2 className="font-display text-[21px] leading-tight text-[var(--ink)]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Pill({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'accent'
  icon?: ReactNode
}) {
  const tones = {
    neutral: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]',
    good: 'bg-[var(--good-wash)] text-[var(--good)] border-[var(--good-line)]',
    bad: 'bg-[var(--bad-wash)] text-[var(--bad)] border-[var(--bad-line)]',
    warn: 'bg-[var(--warn-wash)] text-[var(--warn)] border-[var(--warn-line)]',
    accent: 'bg-[var(--accent-wash)] text-[var(--accent)] border-[var(--line)]',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-[2px] px-2 py-[3px] text-[11.5px] font-semibold tracking-[0.01em] ${tones}`}
    >
      {icon}
      {children}
    </span>
  )
}

/** Hero number with a caption — used for the headline metrics. */
export function StatTile({
  label,
  value,
  suffix,
  sub,
  tone = 'ink',
}: {
  label: string
  value: string | number
  suffix?: string
  sub?: ReactNode
  tone?: 'ink' | 'good' | 'bad' | 'accent'
}) {
  const colour = {
    ink: 'text-[var(--ink)]',
    good: 'text-[var(--good)]',
    bad: 'text-[var(--bad)]',
    accent: 'text-[var(--accent)]',
  }[tone]
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[3px] px-4 py-3.5">
      <div className="eyebrow">{label}</div>
      <div className={`tnum font-display leading-none mt-2 ${colour}`}>
        <span className={value === '—' ? 'text-[22px] text-[var(--faint)]' : 'text-[34px]'}>
          {value}
        </span>
        {suffix ? <span className="text-[17px] ml-0.5 text-[var(--muted)]">{suffix}</span> : null}
      </div>
      {sub ? <div className="mt-1.5 text-[12px] text-[var(--muted)]">{sub}</div> : null}
    </div>
  )
}

/** Thin horizontal meter. Value 0..1. */
export function Meter({
  value,
  tone = 'accent',
  height = 6,
  track = true,
}: {
  value: number
  tone?: 'accent' | 'good' | 'bad' | 'warn'
  height?: number
  track?: boolean
}) {
  const colour = {
    accent: 'var(--accent)',
    good: 'var(--good)',
    bad: 'var(--bad)',
    warn: 'var(--warn)',
  }[tone]
  return (
    <div
      className="w-full rounded-[1px] overflow-hidden"
      style={{ height, background: track ? 'var(--surface-3)' : 'transparent' }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          height: '100%',
          background: colour,
          borderRadius: '1px',
          transition: 'width 220ms ease-out',
        }}
      />
    </div>
  )
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-[var(--line-strong)] rounded-[3px] px-6 py-10 text-center">
      <div className="font-display text-[18px] text-[var(--ink)]">{title}</div>
      <p className="mt-1.5 text-[13.5px] text-[var(--muted)] max-w-[52ch] mx-auto">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="font-mono text-[10.5px] leading-none px-1.5 py-[3px] rounded-[2px] border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--muted)]">
      {children}
    </kbd>
  )
}

/* ---------- icons: 16px stroke set, currentColor ---------- */

const svg = (d: ReactNode, size = 16) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
)

export const IconCheck = ({ size = 16 }: { size?: number }) =>
  svg(<polyline points="3,8.5 6.4,12 13,4.5" />, size)

export const IconCross = ({ size = 16 }: { size?: number }) =>
  svg(
    <>
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </>,
    size,
  )

export const IconFlag = ({ size = 16, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.75 2v12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M3.75 2.9h7.6l-1.5 2.6 1.5 2.6h-7.6z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
)

export const IconStar = ({ size = 16, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.9l1.78 3.6 3.97.58-2.87 2.8.68 3.96L8 10.97l-3.56 1.87.68-3.96-2.87-2.8 3.97-.58z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinejoin="round"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
)

export const IconArrow = ({ dir = 'right', size = 16 }: { dir?: 'left' | 'right'; size?: number }) =>
  svg(
    dir === 'right' ? (
      <>
        <line x1="2.5" y1="8" x2="13" y2="8" />
        <polyline points="9,4 13,8 9,12" />
      </>
    ) : (
      <>
        <line x1="13.5" y1="8" x2="3" y2="8" />
        <polyline points="7,4 3,8 7,12" />
      </>
    ),
    size,
  )

export const IconClock = ({ size = 16 }: { size?: number }) =>
  svg(
    <>
      <circle cx="8" cy="8" r="6.1" />
      <polyline points="8,4.4 8,8.2 10.7,9.7" />
    </>,
    size,
  )

export const IconGrid = ({ size = 16 }: { size?: number }) =>
  svg(
    <>
      <rect x="2.4" y="2.4" width="4.6" height="4.6" />
      <rect x="9" y="2.4" width="4.6" height="4.6" />
      <rect x="2.4" y="9" width="4.6" height="4.6" />
      <rect x="9" y="9" width="4.6" height="4.6" />
    </>,
    size,
  )
