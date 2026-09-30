import type { MiddlewareHandler } from 'hono'

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import { ModuleMocker } from '@/__tests__/module-mocker'
import { HttpStatus } from '@/net/http'

import { createRateLimiter } from '..'

describe('createRateLimiter', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let app: Hono

  beforeEach(async () => {
    await moduleMocker.mock('@/env', () => ({
      isDevOrTestEnv: () => true
    }))

    app = new Hono()
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  const mount = (rateLimiter: MiddlewareHandler) => {
    app.use(rateLimiter)
    app.get('/test', c => c.text('OK'))
  }

  const sendRequests = async (count: number, headers?: HeadersInit) => {
    const statuses: number[] = []
    for (let i = 0; i < count; i++) {
      const res = await app.request('/test', { method: 'GET', headers })
      statuses.push(res.status)
    }

    return statuses
  }

  it('allows requests under the limit', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 3,
        keyGenerator: () => 'test-key'
      })
    )

    expect(await sendRequests(3)).toEqual([
      HttpStatus.OK,
      HttpStatus.OK,
      HttpStatus.OK
    ])
  })

  it('blocks requests over the limit', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 2,
        keyGenerator: () => 'test-key'
      })
    )

    expect(await sendRequests(3)).toEqual([
      HttpStatus.OK,
      HttpStatus.OK,
      HttpStatus.TOO_MANY_REQUESTS
    ])
  })

  it('includes rate limit headers', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 5,
        keyGenerator: () => 'test-key'
      })
    )

    const res = await app.request('/test', { method: 'GET' })

    expect(res.headers.get('RateLimit-Limit')).toBe('5')
    expect(res.headers.get('RateLimit-Remaining')).toBe('4')
    expect(res.headers.has('RateLimit-Reset')).toBe(true)
  })

  it('keeps separate limits per key', async () => {
    let keyCounter = 0

    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 1,
        keyGenerator: () => `key-${keyCounter++}`
      })
    )

    expect(await sendRequests(3)).toEqual([
      HttpStatus.OK,
      HttpStatus.OK,
      HttpStatus.OK
    ])
  })

  it('uses IP address as default key', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 2
      })
    )

    const headers = { 'X-Forwarded-For': '192.168.1.1' }

    expect(await sendRequests(3, headers)).toEqual([
      HttpStatus.OK,
      HttpStatus.OK,
      HttpStatus.TOO_MANY_REQUESTS
    ])
  })

  it('supports custom error message', async () => {
    const customMessage = 'Rate limit exceeded! Please try again later.'

    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 1,
        message: customMessage,
        keyGenerator: () => 'test-key'
      })
    )

    await app.request('/test', { method: 'GET' })
    const res = await app.request('/test', { method: 'GET' })

    expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS)
    expect(await res.text()).toContain(customMessage)
  })

  it('supports custom status code', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 1,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        keyGenerator: () => 'test-key'
      })
    )

    await app.request('/test', { method: 'GET' })
    const res = await app.request('/test', { method: 'GET' })

    expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE)
  })

  it('skips rate limiting when skip function returns true', async () => {
    mount(
      createRateLimiter({
        windowMs: 60 * 1_000,
        limit: 1,
        keyGenerator: () => 'test-key',
        skip: c => c.req.header('X-Skip-Rate-Limit') === 'true'
      })
    )

    await app.request('/test', { method: 'GET' })

    const blocked = await app.request('/test', { method: 'GET' })
    expect(blocked.status).toBe(HttpStatus.TOO_MANY_REQUESTS)

    const skipped = await app.request('/test', {
      method: 'GET',
      headers: { 'X-Skip-Rate-Limit': 'true' }
    })
    expect(skipped.status).toBe(HttpStatus.OK)
  })

  it('uses env-appropriate default limit without configuration', async () => {
    mount(createRateLimiter({ keyGenerator: () => 'test-key' }))

    const res = await app.request('/test', { method: 'GET' })

    expect(res.status).toBe(HttpStatus.OK)
    expect(res.headers.has('RateLimit-Limit')).toBe(true)
    expect(res.headers.get('RateLimit-Limit')).toBe('1000')
  })
})
