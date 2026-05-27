import { beforeEach, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { Role, UserStatus } from '@/types'
import Permission from '@/types/permission'

import { requirePermission } from '../require-permission'

describe('requirePermission Middleware', () => {
  let app: Hono<AppContext>

  beforeEach(() => {
    app = new Hono<AppContext>()
    app.onError(onError)
  })

  const setUser =
    (permissions?: string[]) => async (c: any, next: () => Promise<void>) => {
      c.set('user', {
        id: testUuids.USER_1,
        email: 'user@example.com',
        role: Role.User,
        status: UserStatus.Active,
        permissions
      })
      await next()
    }

  describe('Permission granted', () => {
    it('should allow request when permission is in claims', async () => {
      app.use('/', setUser([Permission.ViewAdmins]))
      app.use('/', requirePermission(Permission.ViewAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.OK)
      const json = await res.json()
      expect(json.message).toBe('success')
    })

    it('should allow request when multiple permissions include required one', async () => {
      app.use(
        '/',
        setUser([
          Permission.ViewDashboard,
          Permission.ViewAdmins,
          Permission.ManageUsers
        ])
      )
      app.use('/', requirePermission(Permission.ViewAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.OK)
    })

    it('should allow Owner with required permission', async () => {
      app.use('/', async (c, next) => {
        c.set('user', {
          id: testUuids.OWNER_1,
          email: 'owner@example.com',
          role: Role.Owner,
          status: UserStatus.Active,
          permissions: [Permission.ViewAdmins, Permission.ManageAdmins]
        })
        await next()
      })
      app.use('/', requirePermission(Permission.ManageAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.OK)
    })
  })

  describe('Permission denied', () => {
    it('should throw Forbidden when permission is missing from claims', async () => {
      app.use('/', setUser([Permission.ViewDashboard]))
      app.use('/', requirePermission(Permission.ViewAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })

    it('should throw Forbidden when permissions is undefined', async () => {
      app.use('/', setUser())
      app.use('/', requirePermission(Permission.ViewAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })

    it('should throw Forbidden when permissions is empty', async () => {
      app.use('/', setUser([]))
      app.use('/', requirePermission(Permission.ViewAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })

    it('should throw Forbidden when Owner lacks required permission', async () => {
      app.use('/', async (c, next) => {
        c.set('user', {
          id: testUuids.OWNER_1,
          email: 'owner@example.com',
          role: Role.Owner,
          status: UserStatus.Active,
          permissions: [Permission.ViewDashboard]
        })
        await next()
      })
      app.use('/', requirePermission(Permission.ManageAdmins))
      app.get('/', c => c.json({ message: 'success' }))

      const res = await app.request('/')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      const json = await res.json()
      expect(json.code).toBe(ErrorCode.Forbidden)
    })
  })
})
