export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export function duration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m < 60) return r ? `${m}m ${r}s` : `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`
}

export function relative(ts: number, lang: 'en' | 'zh' = 'en'): string {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  const zh = lang === 'zh'
  if (mins < 1) return zh ? '剛剛' : 'just now'
  if (mins < 60) return zh ? `${mins} 分鐘前` : `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return zh ? `${hours} 小時前` : `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return zh ? `${days} 天前` : `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(ts).toLocaleDateString(zh ? 'zh-Hant' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
