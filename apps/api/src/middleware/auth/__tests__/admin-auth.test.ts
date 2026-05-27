import { describe, expect, it } from 'bun:test'

import { testUuids } from '@/__tests__'
import env from '@/env'
import { ErrorCode } from '@/errors'
import HttpStatus from '@/net/http/status'
import { signJwt } from '@/security/jwt'
import { Role, UserStatus } from '@/types'

import { requireAdminAuth } from '../index'
import { makeAuthApp } from './utils'

const makeApp = () => makeAuthApp(requireAdminAuth, '/admin')

describe('Admin Authentication Middleware', () => {
  describe('Role Validation', () => {
    it('should allow Admin and Owner roles', async () => {
      const allowedRoles = [Role.Admin, Role.Owner]

      for (const role of allowedRoles) {
        const token = await signJwt(
          {
            id: testUuids.ADMIN_1,
            email: 'admin@example.com',
            role,
            status: UserStatus.Active
          },
          { secret: env.JWT_SECRET }
        )

        const { get } = makeApp()
        const res = await get(token)

        expect(res.status).toBe(HttpStatus.OK)
      }
    })

    it('should reject User role', async () => {
      const token = await signJwt(
        {
          id: testUuids.USER_1,
          email: 'user@example.com',
          role: Role.User,
          status: UserStatus.Active
        },
        { secret: env.JWT_SECRET }
      )

      const { get } = makeApp()
      const res = await get(token)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
      expect(json.error).toBe('Role validation failure')
    })
  })

  describe('UserStatus Validation', () => {
    it('should reject non-Active statuses', async () => {
      const nonActiveStatuses = [
        UserStatus.New,
        UserStatus.Verified,
        UserStatus.Trial,
        UserStatus.Suspended
      ]

      for (const status of nonActiveStatuses) {
        const token = await signJwt(
          {
            id: testUuids.ADMIN_1,
            email: 'admin@example.com',
            role: Role.Admin,
            status
          },
          { secret: env.JWT_SECRET }
        )

        const { get } = makeApp()
        const res = await get(token)

        expect(res.status).toBe(HttpStatus.FORBIDDEN)
        const json = await res.json()
        expect(json.code).toBe(ErrorCode.Forbidden)
        expect(json.error).toBe('UserStatus validation failure')
      }
    })
  })
})
