import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { Permission, Role, UserStatus } from '@/types'

import {
  requirePermission,
  requireSelfOrPermission
} from '../require-permission'

const makeApp = (permissions?: string[]) => {
  const app = new Hono<AppContext>()
  app.onError(onError)
  app.use('/', async (c, next) => {
    c.set('user', {
      id: testUuids.USER_1,
      email: 'user@example.com',
      role: Role.User,
      status: UserStatus.Active,
      permissions
    })
    await next()
  })
  app.use('/', requirePermission(Permission.ViewAdmins))
  app.get('/', c => c.json({ message: 'success' }))

  return app
}

const makeSelfOrPermissionApp = (userId: string, permissions?: string[]) => {
  const app = new Hono<AppContext>()
  app.onError(onError)
  app.use('/teams/:teamId/members/:memberId', async (c, next) => {
    c.set('user', {
      id: userId,
      email: 'user@example.com',
      role: Role.User,
      status: UserStatus.Active,
      permissions
    })
    await next()
  })
  app.use(
    '/teams/:teamId/members/:memberId',
    requireSelfOrPermission(Permission.ManageTeams)
  )
  app.patch('/teams/:teamId/members/:memberId', c =>
    c.json({ message: 'success' })
  )

  return app
}

describe('requirePermission Middleware', () => {
  describe('Permission granted', () => {
    it('should allow request when permission is in claims', async () => {
      const res = await makeApp([Permission.ViewAdmins]).request('/')

      expect(res.status).toBe(HttpStatus.OK)
      const json = await res.json()
      expect(json.message).toBe('success')
    })
  })

  describe('Permission denied', () => {
    it('should throw Forbidden when permission is missing from claims', async () => {
      const res = await makeApp([Permission.ViewDashboard]).request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })

    it('should throw Forbidden when permissions is undefined', async () => {
      const res = await makeApp().request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })
  })
})

describe('requireSelfOrPermission Middleware', () => {
  const path = `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_1}`

  describe('Self access', () => {
    it('should allow when user id matches memberId', async () => {
      const res = await makeSelfOrPermissionApp(testUuids.USER_1).request(
        path,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect((await res.json()).message).toBe('success')
    })

    it('should allow when user id matches memberId even without permissions', async () => {
      const res = await makeSelfOrPermissionApp(testUuids.USER_1, []).request(
        path,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.OK)
    })
  })

  describe('Permission access', () => {
    it('should allow when user has required permission and id differs', async () => {
      const res = await makeSelfOrPermissionApp(testUuids.USER_2, [
        Permission.ManageTeams
      ]).request(path, { method: 'PATCH' })

      expect(res.status).toBe(HttpStatus.OK)
    })
  })

  describe('Access denied', () => {
    it('should throw Forbidden when user is not self and lacks permission', async () => {
      const res = await makeSelfOrPermissionApp(testUuids.USER_2, []).request(
        path,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect((await res.json()).code).toBe(ErrorCode.Forbidden)
    })

    it('should throw Forbidden when user is not self and permissions is undefined', async () => {
      const res = await makeSelfOrPermissionApp(testUuids.USER_2).request(
        path,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect((await res.json()).code).toBe(ErrorCode.Forbidden)
    })
  })
})
