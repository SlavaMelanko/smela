import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  patch,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { EmailSenderType } from '@/services/email'
import { Permission, Role } from '@/types'

import { adminSystemRoute } from '../../..'

describe('admin /system/email-sender-profiles/:profile', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PROFILE_URL = `/api/v1/admin/system/email-sender-profiles/${EmailSenderType.System}`
  const INVALID_PROFILE_URL =
    '/api/v1/admin/system/email-sender-profiles/invalid'

  let app: Hono

  let mockSenderProfile: EmailSenderProfileRecord
  let mockGetEmailSenderProfile: any
  let mockUpdateEmailSenderProfile: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminSystemRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockSenderProfile = {
      profile: EmailSenderType.System,
      email: 'noreply@smela.me',
      name: 'SMELA',
      description: 'Transactional and system notifications',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetEmailSenderProfile = mock(async () => ({
      senderProfile: mockSenderProfile
    }))
    mockUpdateEmailSenderProfile = mock(async () => ({
      senderProfile: mockSenderProfile
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getEmailSenderProfile: mockGetEmailSenderProfile,
      updateEmailSenderProfile: mockUpdateEmailSenderProfile
    }))

    app = buildApp([Permission.ViewSystem, Permission.ManageSystem])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /system/email-sender-profiles/:profile', () => {
    it('should return sender profile with OK status', async () => {
      const res = await get(app, PROFILE_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetEmailSenderProfile).toHaveBeenCalledWith(
        EmailSenderType.System
      )

      const data = await res.json()
      expect(data.senderProfile).toMatchObject({
        profile: EmailSenderType.System,
        email: 'noreply@smela.me'
      })
    })

    it('should reject invalid profile param', async () => {
      const res = await get(app, INVALID_PROFILE_URL)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetEmailSenderProfile).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, PROFILE_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetEmailSenderProfile).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetEmailSenderProfile.mockImplementation(async () => {
        throw new Error('Email sender profile not found')
      })

      const res = await get(app, PROFILE_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /system/email-sender-profiles/:profile', () => {
    const body = { name: 'SMELA Updated' }

    it('should update sender profile and return OK status', async () => {
      const res = await patch(app, PROFILE_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateEmailSenderProfile).toHaveBeenCalledWith(
        EmailSenderType.System,
        body
      )

      const data = await res.json()
      expect(data.senderProfile).toMatchObject({
        profile: EmailSenderType.System
      })
    })

    it('should reject invalid profile param', async () => {
      const res = await patch(app, INVALID_PROFILE_URL, body)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateEmailSenderProfile).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, PROFILE_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateEmailSenderProfile).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewSystem])

      const res = await patch(viewOnlyApp, PROFILE_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateEmailSenderProfile).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateEmailSenderProfile.mockImplementation(async () => {
        throw new Error('Email sender profile not found')
      })

      const res = await patch(app, PROFILE_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
