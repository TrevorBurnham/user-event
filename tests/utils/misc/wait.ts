/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {createConfig} from '#src/setup/setup'
import {wait} from '#src/utils/misc/wait'

test('advances timers when set', async () => {
  const beforeReal = performance.now()
  timers.useFakeTimers()
  const beforeFake = performance.now()

  const config = createConfig({
    delay: 1000,
    advanceTimers: t => timers.advanceTimersByTime(t),
  })
  await wait(config)

  expect(performance.now() - beforeFake).toBe(1000)
  timers.useRealTimers()
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)

test('auto-detects Jest fake timers', async () => {
  const beforeReal = performance.now()

  // Simulate Jest fake timers
  timers.useFakeTimers()
  const beforeFake = performance.now()

  // Mock the Jest global

  const mockAdvanceTimersByTime = jest.fn((ms: number) => {
    timers.advanceTimersByTime(ms)
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).jest = {
    advanceTimersByTime: mockAdvanceTimersByTime,
  }

  // Don't configure advanceTimers - should auto-detect
  const config = createConfig({
    delay: 500,
  })

  await wait(config)

  // Verify auto-detection worked
  expect(mockAdvanceTimersByTime).toHaveBeenCalledWith(500)
  expect(performance.now() - beforeFake).toBe(500)

  // Cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).jest
  timers.useRealTimers()
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)

test('auto-detects Vitest fake timers', async () => {
  const beforeReal = performance.now()

  // Simulate Vitest fake timers
  timers.useFakeTimers()
  const beforeFake = performance.now()

  // Temporarily hide Jest global to test Vitest detection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalJest = (globalThis as any).jest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).jest

  // Mock the Vitest global

  const mockAdvanceTimersByTime = jest.fn((ms: number) => {
    timers.advanceTimersByTime(ms)
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).vi = {
    advanceTimersByTime: mockAdvanceTimersByTime,
  }

  // Don't configure advanceTimers - should auto-detect
  const config = createConfig({
    delay: 750,
  })

  await wait(config)

  // Verify auto-detection worked
  expect(mockAdvanceTimersByTime).toHaveBeenCalledWith(750)
  expect(performance.now() - beforeFake).toBe(750)

  // Cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).vi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).jest = originalJest
  timers.useRealTimers()
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)

test('manual configuration takes precedence over auto-detection', async () => {
  timers.useFakeTimers()

  // Mock the Vitest global

  const autoDetectedAdvance = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).vi = {
    advanceTimersByTime: autoDetectedAdvance,
  }

  // Provide manual configuration

  const manualAdvance = jest.fn((ms: number) => {
    timers.advanceTimersByTime(ms)
  })
  const config = createConfig({
    delay: 100,
    advanceTimers: manualAdvance,
  })

  await wait(config)

  // Manual configuration should be used, not auto-detected
  expect(manualAdvance).toHaveBeenCalledWith(100)
  expect(autoDetectedAdvance).not.toHaveBeenCalled()

  // Cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).vi
  timers.useRealTimers()
}, 10)
