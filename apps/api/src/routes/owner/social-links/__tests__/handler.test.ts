import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLink } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { HttpStatus } from '@/net/http'

import { createSocialLinkHandler, getSocialLinksHandler } from '../handler'

const mockLink: SocialLink = {
  id: testUuids.ADMIN_1,
  name: 'github',
  url: 'https://github.com/smela',
  icon: 'github',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('getSocialLinksHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockGetSocialLinks: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = { json: mockJson }
    mockGetSocialLinks = mock(async () => [mockLink])

    await moduleMocker.mock('@/use-cases/owner', () => ({
      getSocialLinks: mockGetSocialLinks
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should return social links with OK status', async () => {
    const result = await getSocialLinksHandler(mockContext)

    expect(mockGetSocialLinks).toHaveBeenCalled()
    expect(mockJson).toHaveBeenCalledWith(
      { socialLinks: [mockLink] },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })
})

describe('createSocialLinkHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const body = {
    name: 'github',
    url: 'https://github.com/smela',
    icon: 'github'
  }

  let mockContext: any
  let mockJson: any
  let mockCreateSocialLink: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: { valid: mock(() => body) },
      json: mockJson
    }
    mockCreateSocialLink = mock(async () => mockLink)

    await moduleMocker.mock('@/use-cases/owner', () => ({
      createSocialLink: mockCreateSocialLink
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should create a link and return it with CREATED status', async () => {
    const result = await createSocialLinkHandler(mockContext)

    expect(mockCreateSocialLink).toHaveBeenCalledWith(body)
    expect(mockJson).toHaveBeenCalledWith(mockLink, HttpStatus.CREATED)
    expect(result.status).toBe(HttpStatus.CREATED)
  })
})
