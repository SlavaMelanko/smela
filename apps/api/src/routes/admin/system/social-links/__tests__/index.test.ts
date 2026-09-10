import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLinkRecord } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  post,
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
  let mockCreateSocialLink: any

  const validBody = {
    name: 'Mastodon',
    url: 'https://mastodon.social/@smela',
    svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>'
  }

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
        name: 'x',
        url: 'https://x.com/smela',
        svg: '<svg></svg>',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]

    mockGetSocialLinks = mock(async () => ({
      socialLinks: mockSocialLinks
    }))

    mockCreateSocialLink = mock(async () => ({
      socialLink: { ...mockSocialLinks[0], ...validBody }
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getSocialLinks: mockGetSocialLinks,
      createSocialLink: mockCreateSocialLink
    }))

    app = buildApp([Permission.ViewSystem, Permission.ManageSystem])
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
        name: 'x',
        url: 'https://x.com/smela'
      })
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([Permission.ManageSystem])

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

  describe('POST /system/social-links', () => {
    it('should create a social link with CREATED status', async () => {
      const res = await post(app, SOCIAL_LINKS_URL, validBody)

      expect(res.status).toBe(HttpStatus.CREATED)
      expect(mockCreateSocialLink).toHaveBeenCalledWith(validBody)

      const data = await res.json()
      expect(data.socialLink).toMatchObject({
        name: validBody.name,
        url: validBody.url
      })
    })

    it('should reject a body with an invalid url', async () => {
      const res = await post(app, SOCIAL_LINKS_URL, {
        ...validBody,
        url: 'not-a-url'
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockCreateSocialLink).not.toHaveBeenCalled()
    })

    it('should reject a body missing the svg', async () => {
      const { name, url } = validBody

      const res = await post(app, SOCIAL_LINKS_URL, { name, url })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockCreateSocialLink).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const noPermissionApp = buildApp([Permission.ViewSystem])

      const res = await post(noPermissionApp, SOCIAL_LINKS_URL, validBody)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockCreateSocialLink).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockCreateSocialLink.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await post(app, SOCIAL_LINKS_URL, validBody)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
