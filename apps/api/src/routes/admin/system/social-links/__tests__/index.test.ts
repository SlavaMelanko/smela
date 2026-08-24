import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLinkRecord } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { adminSystemRoute } from '../..'

describe('admin /system/social-links', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const SOCIAL_LINKS_URL = '/api/v1/admin/system/social-links'

  let app: Hono

  let mockSocialLinks: SocialLinkRecord[]
  let mockGetSocialLinks: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminSystemRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockSocialLinks = [
      {
        id: testUuids.ADMIN_1,
        network: 'x',
        url: 'https://x.com/smela',
        svg: '<svg></svg>',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]

    mockGetSocialLinks = mock(async () => ({
      socialLinks: mockSocialLinks
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getSocialLinks: mockGetSocialLinks
    }))

    app = buildApp([Permission.ViewSystem])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /system/social-links', () => {
    it('should return social links with OK status', async () => {
      const res = await get(app, SOCIAL_LINKS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetSocialLinks).toHaveBeenCalled()

      const data = await res.json()
      expect(data.socialLinks).toHaveLength(1)
      expect(data.socialLinks[0]).toMatchObject({
        network: 'x',
        url: 'https://x.com/smela'
      })
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, SOCIAL_LINKS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetSocialLinks).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetSocialLinks.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await get(app, SOCIAL_LINKS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
