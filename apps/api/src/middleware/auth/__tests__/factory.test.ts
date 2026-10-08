import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { env } from '@/env'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { signJwt } from '@/security/jwt'
import { Role, UserStatus } from '@/types'

import { createAuthMiddleware } from '../factory'

describe('createAuthMiddleware', () => {
  const mockUser = {
    id: testUuids.USER_1,
    email: 'test@example.com',
    role: Role.User,
    status: UserStatus.Verified
  }

  const buildApp = ({ statusValid = true, roleValid = true } = {}) => {
    const app = new Hono<AppContext>()
    app.onError(onError)
    app.use(
      '/',
      createAuthMiddleware(
        () => statusValid,
        () => roleValid
      )
    )
    app.get('/', c => c.json({ user: c.get('user') }))

    return app
  }

  const requestWith = async (app: Hono<AppContext>, authorization?: string) =>
    app.request(
      '/',
      authorization ? { headers: { Authorization: authorization } } : {}
    )

  const signValidToken = async () =>
    signJwt(mockUser, { secret: env.JWT_SECRET })

  describe('unauthorized requests', () => {
    it('rejects request without token', async () => {
      const res = await requestWith(buildApp())

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Unauthorized)
      expect(json.error).toBe('No authentication token provided')
    })

    const cases = [
      {
        name: 'Authorization header is malformed',
        authorization: async () => 'not-bearer-format'
      },
      {
        name: 'Bearer prefix has no space',
        authorization: async () => 'BearerTokenWithoutSpace'
      },
      {
        name: 'JWT signature is invalid',
        authorization: async () =>
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
      },
      {
        name: 'JWT is expired',
        authorization: async () =>
          `Bearer ${await signJwt(mockUser, { secret: env.JWT_SECRET, expiresIn: -1 })}`
      },
      {
        name: 'JWT is signed with wrong secret',
        authorization: async () =>
          `Bearer ${await signJwt(mockUser, { secret: 'wrong-secret-key' })}`
      }
    ]

    cases.forEach(({ name, authorization }) => {
      it(`rejects request when ${name}`, async () => {
        const res = await requestWith(buildApp(), await authorization())

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
        const json = await res.json()
        expect(json.code).toBe(ErrorCode.Unauthorized)
      })
    })
  })

  describe('validator failures', () => {
    const cases = [
      {
        name: 'status',
        options: { statusValid: false },
        error: 'UserStatus validation failure'
      },
      {
        name: 'role',
        options: { roleValid: false },
        error: 'Role validation failure'
      }
    ]

    cases.forEach(({ name, options, error }) => {
      it(`re-throws AppError from ${name} validator`, async () => {
        const res = await requestWith(
          buildApp(options),
          `Bearer ${await signValidToken()}`
        )

        expect(res.status).toBe(HttpStatus.FORBIDDEN)
        const json = await res.json()
        expect(json.code).toBe(ErrorCode.Forbidden)
        expect(json.error).toBe(error)
      })
    })
  })

  it('sets user claims in context on successful authentication', async () => {
    const res = await requestWith(
      buildApp(),
      `Bearer ${await signValidToken()}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    const json = await res.json()
    expect(json.user).toMatchObject(mockUser)
  })
})
