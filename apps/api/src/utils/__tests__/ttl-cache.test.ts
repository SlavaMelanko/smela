import { afterEach, describe, expect, it, setSystemTime } from 'bun:test'

import { TtlCache } from '../ttl-cache'

const ONE_HOUR_MS = 60 * 60 * 1000

describe('TtlCache', () => {
  afterEach(() => {
    setSystemTime()
  })

  const countedLoader = (value: number) => {
    let calls = 0
    const load = async () => {
      calls++

      return value
    }

    return { load, calls: () => calls }
  }

  it('loads the value on first access', async () => {
    const { load } = countedLoader(1)
    const cache = new TtlCache(load, ONE_HOUR_MS)

    expect(await cache.get()).toBe(1)
  })

  it('serves repeated lookups from the cache within the TTL', async () => {
    const { load, calls } = countedLoader(1)
    const cache = new TtlCache(load, ONE_HOUR_MS)

    await cache.get()
    await cache.get()

    expect(calls()).toBe(1)
  })

  it('reloads after the TTL expires', async () => {
    setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const { load, calls } = countedLoader(1)
    const cache = new TtlCache(load, ONE_HOUR_MS)

    await cache.get()
    setSystemTime(new Date(Date.now() + ONE_HOUR_MS))
    await cache.get()

    expect(calls()).toBe(2)
  })

  it('reloads after being invalidated within the TTL', async () => {
    const { load, calls } = countedLoader(1)
    const cache = new TtlCache(load, ONE_HOUR_MS)

    await cache.get()
    cache.invalidate()
    await cache.get()

    expect(calls()).toBe(2)
  })

  it('serves the updated value after being invalidated', async () => {
    let value = 1
    const cache = new TtlCache(async () => value, ONE_HOUR_MS)

    await cache.get()
    value = 2
    cache.invalidate()

    expect(await cache.get()).toBe(2)
  })
})
