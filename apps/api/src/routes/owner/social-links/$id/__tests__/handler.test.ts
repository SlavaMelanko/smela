import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLink } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { HttpStatus } from '@/net/http'

import { deleteSocialLinkHandler, updateSocialLinkHandler } from '../handler'

const mockLink: SocialLink = {
  id: testUuids.ADMIN_1,
  name: 'github',
  url: 'https://github.com/smela',
  icon: 'github',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('updateSocialLinkHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const updates = { url: 'https://github.com/new' }

  let mockContext: any
  let mockJson: any
  let mockUpdateSocialLink: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: {
        valid: mock((target: string) =>
          target === 'param' ? { socialLinkId: mockLink.id } : updates
        )
      },
      json: mockJson
    }
    mockUpdateSocialLink = mock(async () => mockLink)

    await moduleMocker.mock('@/use-cases/owner', () => ({
      updateSocialLink: mockUpdateSocialLink
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should update a link and return it with OK status', async () => {
    const result = await updateSocialLinkHandler(mockContext)

    expect(mockUpdateSocialLink).toHaveBeenCalledWith(mockLink.id, updates)
    expect(mockJson).toHaveBeenCalledWith(mockLink, HttpStatus.OK)
    expect(result.status).toBe(HttpStatus.OK)
  })
})

describe('deleteSocialLinkHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockBody: any
  let mockDeleteSocialLink: any

  beforeEach(async () => {
    mockBody = mock((_: null, status: number) => ({ status }))
    mockContext = {
      req: { valid: mock(() => ({ socialLinkId: mockLink.id })) },
      body: mockBody
    }
    mockDeleteSocialLink = mock(async () => undefined)

    await moduleMocker.mock('@/use-cases/owner', () => ({
      deleteSocialLink: mockDeleteSocialLink
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should delete a link and return NO_CONTENT status', async () => {
    const result = await deleteSocialLinkHandler(mockContext)

    expect(mockDeleteSocialLink).toHaveBeenCalledWith(mockLink.id)
    expect(mockBody).toHaveBeenCalledWith(null, HttpStatus.NO_CONTENT)
    expect(result.status).toBe(HttpStatus.NO_CONTENT)
  })
})
