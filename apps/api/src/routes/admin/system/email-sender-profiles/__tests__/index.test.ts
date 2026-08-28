import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { EmailSenderType } from '@/services/email'
import { Permission, Role } from '@/types'

import { adminSystemRoute } from '../..'

describe('admin /system/email-sender-profiles', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PROFILES_URL = '/api/v1/admin/system/email-sender-profiles'

  let app: Hono

  let mockSenderProfiles: EmailSenderProfileRecord[]
  let mockGetEmailSenderProfiles: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminSystemRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockSenderProfiles = [
      {
        profile: EmailSenderType.System,
        email: 'noreply@smela.me',
        name: 'SMELA',
        description: 'Transactional and system notifications',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]

    mockGetEmailSenderProfiles = mock(async () => ({
      senderProfiles: mockSenderProfiles
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getEmailSenderProfiles: mockGetEmailSenderProfiles
    }))

    app = buildApp([Permission.ViewSystem])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /system/email-sender-profiles', () => {
    it('should return sender profiles with OK status', async () => {
      const res = await get(app, PROFILES_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetEmailSenderProfiles).toHaveBeenCalled()

      const data = await res.json()
      expect(data.senderProfiles).toHaveLength(1)
      expect(data.senderProfiles[0]).toMatchObject({
        profile: EmailSenderType.System,
        email: 'noreply@smela.me',
        name: 'SMELA'
      })
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, PROFILES_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetEmailSenderProfiles).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetEmailSenderProfiles.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await get(app, PROFILES_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
