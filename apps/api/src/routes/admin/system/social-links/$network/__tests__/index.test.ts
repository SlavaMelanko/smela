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

import { adminSystemRoute } from '../../..'

describe('admin /system/social-links/:network', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const NETWORK_URL = '/api/v1/admin/system/social-links/facebook'

  let app: Hono

  let mockSocialLink: SocialLinkRecord
  let mockGetSocialLink: any

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
      id: testUuids.ADMIN_1,
      network: 'facebook',
      url: 'https://facebook.com/smela',
      svg: '<svg></svg>',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetSocialLink = mock(async () => ({ socialLink: mockSocialLink }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getSocialLink: mockGetSocialLink,
      getSocialLinks: mock(async () => ({ socialLinks: [] }))
    }))

    app = buildApp([Permission.ViewSystem])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /system/social-links/:network', () => {
    it('should return social link with OK status', async () => {
      const res = await get(app, NETWORK_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetSocialLink).toHaveBeenCalledWith('facebook')

      const data = await res.json()
      expect(data.socialLink).toMatchObject({
        network: 'facebook',
        url: 'https://facebook.com/smela'
      })
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, NETWORK_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetSocialLink).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetSocialLink.mockImplementation(async () => {
        throw new Error('Social link not found')
      })

      const res = await get(app, NETWORK_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
