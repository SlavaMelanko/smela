import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLinkRecord } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  patch,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { adminSystemRoute } from '../../..'

describe('admin /system/social-links/:id', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const SOCIAL_LINK_URL = `/api/v1/admin/system/social-links/${testUuids.SOCIAL_LINK_1}`

  let app: Hono

  let mockSocialLink: SocialLinkRecord
  let mockGetSocialLink: any
  let mockUpdateSocialLink: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminSystemRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockSocialLink = {
      id: testUuids.SOCIAL_LINK_1,
      name: 'facebook',
      url: 'https://facebook.com/smela',
      svg: '<svg></svg>',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetSocialLink = mock(async () => ({ socialLink: mockSocialLink }))
    mockUpdateSocialLink = mock(async () => ({ socialLink: mockSocialLink }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getSocialLink: mockGetSocialLink,
      getSocialLinks: mock(async () => ({ socialLinks: [] })),
      updateSocialLink: mockUpdateSocialLink
    }))

    app = buildApp([Permission.ViewSystem, Permission.ManageSystem])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /system/social-links/:id', () => {
    it('should return social link with OK status', async () => {
      const res = await get(app, SOCIAL_LINK_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetSocialLink).toHaveBeenCalledWith(testUuids.SOCIAL_LINK_1)

      const data = await res.json()
      expect(data.socialLink).toMatchObject({
        name: 'facebook',
        url: 'https://facebook.com/smela'
      })
    })

    it('should reject invalid id param', async () => {
      const res = await get(app, '/api/v1/admin/system/social-links/not-a-uuid')

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetSocialLink).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, SOCIAL_LINK_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetSocialLink).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetSocialLink.mockImplementation(async () => {
        throw new Error('Social link not found')
      })

      const res = await get(app, SOCIAL_LINK_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /system/social-links/:id', () => {
    const body = { name: 'Facebook' }

    it('should update social link and return OK status', async () => {
      const res = await patch(app, SOCIAL_LINK_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateSocialLink).toHaveBeenCalledWith(
        testUuids.SOCIAL_LINK_1,
        body
      )

      const data = await res.json()
      expect(data.socialLink).toMatchObject({
        name: 'facebook'
      })
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, SOCIAL_LINK_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateSocialLink).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewSystem])

      const res = await patch(viewOnlyApp, SOCIAL_LINK_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateSocialLink).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateSocialLink.mockImplementation(async () => {
        throw new Error('Social link not found')
      })

      const res = await patch(app, SOCIAL_LINK_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
