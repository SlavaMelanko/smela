import { describe, expect, it } from 'bun:test'

import { testUuids } from '@/__tests__'
import env from '@/env'
import { ErrorCode } from '@/errors'
import HttpStatus from '@/net/http/status'
import { signJwt } from '@/security/jwt'
import { Role, UserStatus } from '@/types'

import { requireOwnerAuth } from '../index'
import { makeAuthApp } from './utils'

const makeApp = () => makeAuthApp(requireOwnerAuth, '/owner')

describe('Owner Authentication Middleware', () => {
  describe('Role Validation', () => {
    it('should allow Owner role', async () => {
      const token = await signJwt(
        {
          id: testUuids.OWNER_1,
          email: 'owner@example.com',
          role: Role.Owner,
          status: UserStatus.Active
        },
        { secret: env.JWT_SECRET }
      )

      const { get } = makeApp()
      const res = await get(token)

      expect(res.status).toBe(HttpStatus.OK)
    })

    it('should reject Admin and User roles', async () => {
      const rejectedRoles = [Role.Admin, Role.User]

      for (const role of rejectedRoles) {
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

        expect(res.status).toBe(HttpStatus.FORBIDDEN)
        const json = await res.json()
        expect(json.code).toBe(ErrorCode.Forbidden)
        expect(json.error).toBe('Role validation failure')
      }
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
            id: testUuids.OWNER_1,
            email: 'owner@example.com',
            role: Role.Owner,
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
