import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { AppContext } from '@/context'

import { APP_ERROR_NAME, AppError, ErrorCode, ErrorRegistry } from '@/errors'
import { HttpStatus } from '@/net/http'

import { onError } from '../on-error'

describe('onError', () => {
  it('returns AppError code, message, and status', async () => {
    const app = new Hono<AppContext>()

    app.onError(onError)

    app.get('/app-error', () => {
      throw new AppError(ErrorCode.EmailAlreadyInUse)
    })

    const res = await app.request('/app-error')
    const body = await res.json()

    expect(res.status).toBe(HttpStatus.CONFLICT)
    expect(body).toMatchObject({
      code: ErrorCode.EmailAlreadyInUse,
      error: ErrorRegistry[ErrorCode.EmailAlreadyInUse].message,
      name: APP_ERROR_NAME
    })
  })

  it('hides code and message of non-AppError errors', async () => {
    const app = new Hono<AppContext>()

    app.onError(onError)

    app.get('/db-error', () => {
      const error = new Error('duplicate key value violates unique constraint')

      ;(error as any).code = '23505'
      throw error
    })

    const res = await app.request('/db-error')
    const body = await res.json()

    expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(body).toMatchObject({
      code: ErrorCode.InternalError,
      error: ErrorRegistry[ErrorCode.InternalError].message,
      name: APP_ERROR_NAME
    })
  })

  it('maps 4xx HTTPException to bad request with its message', async () => {
    const app = new Hono<AppContext>()

    app.onError(onError)

    app.get('/http-exception', () => {
      throw new HTTPException(HttpStatus.UNPROCESSABLE_ENTITY, {
        message: 'Malformed JSON'
      })
    })

    const res = await app.request('/http-exception')
    const body = await res.json()

    expect(res.status).toBe(HttpStatus.BAD_REQUEST)
    expect(body).toMatchObject({
      code: ErrorCode.BadRequest,
      error: 'Malformed JSON'
    })
  })

  it('maps 5xx HTTPException without message to internal error', async () => {
    const app = new Hono<AppContext>()

    app.onError(onError)

    app.get('/http-exception', () => {
      throw new HTTPException(HttpStatus.SERVICE_UNAVAILABLE)
    })

    const res = await app.request('/http-exception')
    const body = await res.json()

    expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(body).toMatchObject({
      code: ErrorCode.InternalError,
      error: ErrorRegistry[ErrorCode.InternalError].message
    })
  })

  it('omits stack trace in test environment', async () => {
    const app = new Hono<AppContext>()

    app.onError(onError)

    app.get('/error', () => {
      throw new Error('Test error')
    })

    const res = await app.request('/error')
    const body = await res.json()

    // test environment should not include stack traces (production-like behavior)
    expect(body.stack).toBeUndefined()
  })
})
