import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { z } from 'zod'

import { post } from '@/__tests__/request'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import { HttpStatus } from '@/net/http'

import { validateBody } from '../validate-request'

const schema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

const makeApp = () => {
  const app = new Hono()
  app.onError(onError)
  app.post('/test', validateBody(schema), c => c.json({ success: true }))

  return app
}

describe('Request Validator Middleware', () => {
  it('should pass valid payload to the next handler', async () => {
    const response = await post(makeApp(), '/test', {
      email: 'user@example.com',
      password: 'SecurePass123!'
    })

    expect(response.status).toBe(HttpStatus.OK)
    expect(await response.json()).toEqual({ success: true })
  })

  it('should return validation error with issue details when payload is invalid', async () => {
    const response = await post(makeApp(), '/test', {
      email: 'user@example.com'
    })

    expect(response.status).toBe(HttpStatus.BAD_REQUEST)

    const json = await response.json()
    expect(json).toHaveProperty('code', ErrorCode.ValidationError)

    const issues = JSON.parse(json.error as string) as {
      code: string
      path: string[]
    }[]
    expect(issues[0]).toMatchObject({
      code: 'invalid_type',
      path: ['password']
    })
  })
})
