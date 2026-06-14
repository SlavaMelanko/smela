import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SocialLink } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'

import {
  createSocialLink,
  deleteSocialLink,
  getSocialLinks,
  updateSocialLink
} from '..'

describe('social links use-cases', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const mockLink: SocialLink = {
    id: testUuids.ADMIN_1,
    name: 'github',
    url: 'https://github.com/smela',
    icon: 'github',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }

  const expectedCachePayload = {
    socialLinks: [
      { name: mockLink.name, url: mockLink.url, icon: mockLink.icon }
    ]
  }

  let mockFindAll: any
  let mockCreate: any
  let mockUpdate: any
  let mockDelete: any
  let mockSetConfig: any

  beforeEach(async () => {
    mockFindAll = mock(async () => [mockLink])
    mockCreate = mock(async () => mockLink)
    mockUpdate = mock(async () => mockLink)
    mockDelete = mock(async () => undefined)
    mockSetConfig = mock(() => undefined)

    await moduleMocker.mock('@/data', () => ({
      appRepo: {
        findSocialLinks: mockFindAll,
        createSocialLink: mockCreate,
        updateSocialLink: mockUpdate,
        deleteSocialLink: mockDelete
      }
    }))

    await moduleMocker.mock('@/services', () => ({
      emailAgent: { setConfig: mockSetConfig }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should return all social links without touching the email cache', async () => {
    const result = await getSocialLinks()

    expect(mockFindAll).toHaveBeenCalled()
    expect(mockSetConfig).not.toHaveBeenCalled()
    expect(result).toEqual([mockLink])
  })

  it('should create a link and sync the email cache', async () => {
    const input = {
      name: 'github',
      url: 'https://github.com/smela',
      icon: 'github'
    }

    const result = await createSocialLink(input)

    expect(mockCreate).toHaveBeenCalledWith(input)
    expect(mockSetConfig).toHaveBeenCalledWith(expectedCachePayload)
    expect(result).toEqual(mockLink)
  })

  it('should update a link and sync the email cache', async () => {
    const updates = { url: 'https://github.com/new' }

    const result = await updateSocialLink(mockLink.id, updates)

    expect(mockUpdate).toHaveBeenCalledWith(mockLink.id, updates)
    expect(mockSetConfig).toHaveBeenCalledWith(expectedCachePayload)
    expect(result).toEqual(mockLink)
  })

  it('should delete a link and sync the email cache', async () => {
    await deleteSocialLink(mockLink.id)

    expect(mockDelete).toHaveBeenCalledWith(mockLink.id)
    expect(mockSetConfig).toHaveBeenCalledWith(expectedCachePayload)
  })
})
