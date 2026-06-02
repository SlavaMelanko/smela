import { describe, expect, it } from 'bun:test'

import { testUuids } from '@/__tests__'
import env from '@/env'
import { ErrorCode } from '@/errors'
import HttpStatus from '@/net/http/status'
import { signJwt } from '@/security/jwt'
import { Role, UserStatus } from '@/types'

import { requireUserAuth, requireVerifiedUserAuth } from '../index'
import { makeAuthApp } from './utils'

const makeAppWithStrictAuth = () =>
  makeAuthApp(requireVerifiedUserAuth, '/strict')
const makeAppWithRelaxedAuth = () => makeAuthApp(requireUserAuth, '/relaxed')

describe('Auth Middleware - New User Access', () => {
  describe('Strict Auth - UserStatus Validation', () => {
    it('should reject New status', async () => {
      const token = await signJwt(
        {
          id: testUuids.USER_1,
          email: 'user@example.com',
          role: Role.User,
          status: UserStatus.New
        },
        { secret: env.JWT_SECRET }
      )

      const { get } = makeAppWithStrictAuth()
      const res = await get(token)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
      expect(json.error).toBe('UserStatus validation failure')
    })

    it('should accept active statuses', async () => {
      const activeStatuses = [
        UserStatus.Verified,
        UserStatus.Trial,
        UserStatus.Active
      ]

      for (const status of activeStatuses) {
        const token = await signJwt(
          {
            id: testUuids.USER_1,
            email: 'user@example.com',
            role: Role.User,
            status
          },
          { secret: env.JWT_SECRET }
        )

        const { get } = makeAppWithStrictAuth()
        const res = await get(token)

        expect(res.status).toBe(HttpStatus.OK)
        const json = await res.json()
        expect(json.message).toBe('success')
      }
    })
  })

  describe('Relaxed Auth - UserStatus Validation', () => {
    it('should accept new and active statuses', async () => {
      const allowedStatuses = [
        UserStatus.New,
        UserStatus.Verified,
        UserStatus.Trial,
        UserStatus.Active
      ]

      for (const status of allowedStatuses) {
        const token = await signJwt(
          {
            id: testUuids.USER_2,
            email: 'user@example.com',
            role: Role.User,
            status
          },
          { secret: env.JWT_SECRET }
        )

        const { get } = makeAppWithRelaxedAuth()
        const res = await get(token)

        expect(res.status).toBe(HttpStatus.OK)
        const json = await res.json()
        expect(json.message).toBe('success')
      }
    })

    it('should reject Suspended status', async () => {
      const token = await signJwt(
        {
          id: testUuids.USER_3,
          email: 'user@example.com',
          role: Role.User,
          status: UserStatus.Suspended
        },
        { secret: env.JWT_SECRET }
      )

      const { get } = makeAppWithRelaxedAuth()
      const res = await get(token)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
      expect(json.error).toBe('UserStatus validation failure')
    })
  })
})
