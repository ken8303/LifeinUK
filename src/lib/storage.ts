const NS = 'luk.v1'

/**
 * localStorage can throw (private mode, blocked site data, quota) and can come
 * back empty. Every read and write is guarded; the app runs fine with no store.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage unavailable or full — session continues in memory */
  }
}

export function load<T>(slot: string, fallback: T): T {
  const raw = safeGet(`${NS}.${slot}`)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const timers: Record<string, number> = {}

/** Debounced so rapid answering does not hammer the store. */
export function save(slot: string, value: unknown, delay = 250): void {
  const key = `${NS}.${slot}`
  window.clearTimeout(timers[slot])
  timers[slot] = window.setTimeout(() => {
    safeSet(key, JSON.stringify(value))
  }, delay)
}

export function saveNow(slot: string, value: unknown): void {
  window.clearTimeout(timers[slot])
  safeSet(`${NS}.${slot}`, JSON.stringify(value))
}

export function clearAll(): void {
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith(NS)) window.localStorage.removeItem(k)
    }
  } catch {
    /* nothing to clear */
  }
}

export function storageAvailable(): boolean {
  try {
    const probe = `${NS}.probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
