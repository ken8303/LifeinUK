import { useEffect } from 'react'

export interface KeyMap {
  onOption?: (index: number) => void
  onNext?: () => void
  onPrev?: () => void
  onFlag?: () => void
  onBookmark?: () => void
  onReview?: () => void
  onEscape?: () => void
  enabled?: boolean
}

const LETTER_KEYS = ['a', 'b', 'c', 'd']

/**
 * 1–4 or A–D pick an answer, Enter moves on, F flags, B bookmarks,
 * arrows step through, R opens the review grid, Esc closes overlays.
 */
export function useKeyboard(map: KeyMap): void {
  const { enabled = true } = map
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (/^[1-4]$/.test(key) && map.onOption) {
        e.preventDefault()
        map.onOption(Number(key) - 1)
        return
      }
      if (LETTER_KEYS.includes(key) && key !== 'b' && map.onOption) {
        e.preventDefault()
        map.onOption(LETTER_KEYS.indexOf(key))
        return
      }
      // B is both "option B" and "bookmark": bookmark wins only with Shift.
      if (key === 'b') {
        if (e.shiftKey && map.onBookmark) {
          e.preventDefault()
          map.onBookmark()
        } else if (map.onOption) {
          e.preventDefault()
          map.onOption(1)
        }
        return
      }
      if (key === 'enter' && map.onNext) {
        e.preventDefault()
        map.onNext()
        return
      }
      if ((key === 'arrowright' || key === 'pagedown') && map.onNext) {
        e.preventDefault()
        map.onNext()
        return
      }
      if ((key === 'arrowleft' || key === 'pageup') && map.onPrev) {
        e.preventDefault()
        map.onPrev()
        return
      }
      if (key === 'f' && map.onFlag) {
        e.preventDefault()
        map.onFlag()
        return
      }
      if (key === 'r' && map.onReview) {
        e.preventDefault()
        map.onReview()
        return
      }
      if (key === 'escape' && map.onEscape) {
        e.preventDefault()
        map.onEscape()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [map, enabled])
}
