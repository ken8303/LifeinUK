import { useEffect, useState } from 'react'

/** Re-renders every `ms` while active — drives the exam countdown. */
export function useTicker(active: boolean, ms = 250): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTick((t) => t + 1), ms)
    return () => window.clearInterval(id)
  }, [active, ms])
  return tick
}

/** True once the viewport is at least `min` px wide. */
export function useMinWidth(min: number): boolean {
  const [ok, setOk] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= min,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`)
    const update = () => setOk(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [min])
  return ok
}
