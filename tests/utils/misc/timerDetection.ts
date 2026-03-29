/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {getTimerAdvancer} from '../../../src/utils/misc/timerDetection'

describe('getTimerAdvancer', () => {
  it('returns null when no framework global is present', () => {
    expect(getTimerAdvancer()).toBe(null)
  })

  it('returns Jest advanceTimersByTime when jest global is present', () => {
    const advanceTimersByTime = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).jest = {advanceTimersByTime}

    const advancer = getTimerAdvancer()
    expect(advancer).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    advancer?.(100)
    expect(advanceTimersByTime).toHaveBeenCalledWith(100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).jest
  })

  it('returns Vitest advanceTimersByTime when vi global is present', () => {
    const advanceTimersByTime = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).vi = {advanceTimersByTime}

    const advancer = getTimerAdvancer()
    expect(advancer).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    advancer?.(200)
    expect(advanceTimersByTime).toHaveBeenCalledWith(200)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).vi
  })

  it('prefers Jest over Vitest when both globals are present', () => {
    const jestAdvance = jest.fn()
    const viAdvance = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).jest = {advanceTimersByTime: jestAdvance}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).vi = {advanceTimersByTime: viAdvance}

    const advancer = getTimerAdvancer()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    advancer?.(300)

    expect(jestAdvance).toHaveBeenCalledWith(300)
    expect(viAdvance).not.toHaveBeenCalled()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).jest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).vi
  })
})
