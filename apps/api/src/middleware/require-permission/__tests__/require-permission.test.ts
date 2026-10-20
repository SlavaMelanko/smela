import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { Permission, Role, UserStatus } from '@/types'

import { requirePermission } from '../require-permission'

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

describe('requirePermission', () => {
  it('allows request when permission is in claims', async () => {
    const res = await makeApp([Permission.ViewAdmins]).request('/')

    expect(res.status).toBe(HttpStatus.OK)
    const json = await res.json()
    expect(json.message).toBe('success')
  })

  it('throws Forbidden when permission is missing from claims', async () => {
    const res = await makeApp([Permission.ViewDashboard]).request('/')

    expect(res.status).toBe(HttpStatus.FORBIDDEN)
    const json = await res.json()
    expect(json.code).toBe(ErrorCode.Forbidden)
  })

  it('throws Forbidden when permissions is undefined', async () => {
    const res = await makeApp().request('/')

    expect(res.status).toBe(HttpStatus.FORBIDDEN)
    const json = await res.json()
    expect(json.code).toBe(ErrorCode.Forbidden)
  })
})
