interface JestGlobal {
  advanceTimersByTime: (ms: number) => void
}

interface VitestGlobal {
  advanceTimersByTime: (ms: number) => void | Promise<void>
}

type GlobalWithTimers = typeof globalThis & {
  jest?: JestGlobal
  vi?: VitestGlobal
}

/**
 * Gets the timer advancement function from the detected testing framework, if any.
 *
 * Checks for `globalThis.jest` (Jest) and `globalThis.vi` (Vitest) globals.
 * When both are present, Jest takes precedence for backward compatibility.
 *
 * Note: This detects the presence of the framework global, not whether
 * fake timers are currently active. Calling `advanceTimersByTime` with
 * real timers is a no-op in both Jest and Vitest.
 *
 * @returns A bound function that advances fake timers, or null if no framework detected
 */
export function getTimerAdvancer(): ((ms: number) => void | Promise<void>) |
    null {
  const g = globalThis as GlobalWithTimers

  if (g.jest && typeof g.jest.advanceTimersByTime === 'function') {
    return g.jest.advanceTimersByTime.bind(g.jest)
  }

  if (g.vi && typeof g.vi.advanceTimersByTime === 'function') {
    return g.vi.advanceTimersByTime.bind(g.vi)
  }

  return null
}
