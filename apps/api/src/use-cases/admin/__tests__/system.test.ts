import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord, SocialLinkRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { EmailSenderType } from '@/services/email'

import {
  createSocialLink,
  getEmailSenderProfile,
  getEmailSenderProfiles,
  updateEmailSenderProfile
} from '../system'

const buildSenderProfile = (
  overrides: Partial<EmailSenderProfileRecord> = {}
): EmailSenderProfileRecord => ({
  profile: EmailSenderType.System,
  email: 'noreply@smela.me',
  name: 'SMELA',
  description: 'Transactional and system notifications',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

describe('getEmailSenderProfiles', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockSenderProfiles: EmailSenderProfileRecord[]
  let mockFindEmailSenderProfiles: any

  beforeEach(async () => {
    mockSenderProfiles = [buildSenderProfile()]

    mockFindEmailSenderProfiles = mock(async () => mockSenderProfiles)

    await moduleMocker.mock('@/data', () => ({
      systemRepo: { listEmailSenderProfiles: mockFindEmailSenderProfiles }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should return all sender profiles', async () => {
    const result = await getEmailSenderProfiles()

    expect(mockFindEmailSenderProfiles).toHaveBeenCalled()
    expect(result).toEqual({ senderProfiles: mockSenderProfiles })
  })
})

describe('getEmailSenderProfile', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockSenderProfile: EmailSenderProfileRecord | undefined
  let mockFindEmailSenderProfile: any

  const senderProfile = buildSenderProfile()

  beforeEach(async () => {
    mockSenderProfile = senderProfile

    mockFindEmailSenderProfile = mock(async () => mockSenderProfile)

    await moduleMocker.mock('@/data', () => ({
      systemRepo: { findEmailSenderProfile: mockFindEmailSenderProfile }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should return the requested sender profile', async () => {
    const result = await getEmailSenderProfile(EmailSenderType.System)

    expect(mockFindEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderType.System
    )
    expect(result).toEqual({ senderProfile })
  })

  it('should throw when the sender profile does not exist', async () => {
    mockSenderProfile = undefined

    expect(
      getEmailSenderProfile(EmailSenderType.Support)
    ).rejects.toMatchObject({ code: ErrorCode.NotFound })
  })
})

describe('updateEmailSenderProfile', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockSenderProfile: EmailSenderProfileRecord | undefined
  let mockUpdatedSenderProfile: EmailSenderProfileRecord
  let mockFindEmailSenderProfile: any
  let mockUpdateEmailSenderProfile: any
  let mockInvalidateSenderProfiles: any

  beforeEach(async () => {
    mockSenderProfile = buildSenderProfile()
    mockUpdatedSenderProfile = buildSenderProfile({ name: 'SMELA Updated' })

    mockFindEmailSenderProfile = mock(async () => mockSenderProfile)
    mockUpdateEmailSenderProfile = mock(async () => mockUpdatedSenderProfile)
    mockInvalidateSenderProfiles = mock(() => {})

    await moduleMocker.mock('@/data', () => ({
      systemRepo: {
        findEmailSenderProfile: mockFindEmailSenderProfile,
        updateEmailSenderProfile: mockUpdateEmailSenderProfile
      }
    }))

    await moduleMocker.mock('@/services', () => ({
      emailService: { invalidateSenderProfiles: mockInvalidateSenderProfiles }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should update the sender profile', async () => {
    const updates = { name: 'SMELA Updated' }

    const result = await updateEmailSenderProfile(
      EmailSenderType.System,
      updates
    )

    expect(mockUpdateEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderType.System,
      updates
    )
    expect(result).toEqual({ senderProfile: mockUpdatedSenderProfile })
  })

  it('should invalidate the cached sender profiles after updating', async () => {
    await updateEmailSenderProfile(EmailSenderType.System, { name: 'SMELA' })

    expect(mockInvalidateSenderProfiles).toHaveBeenCalled()
  })

  it('should not update when the sender profile does not exist', async () => {
    mockSenderProfile = undefined

    const error: any = await updateEmailSenderProfile(EmailSenderType.Support, {
      name: 'Nope'
    }).catch((e: unknown) => e)

    expect(error).toMatchObject({ code: ErrorCode.NotFound })
    expect(mockUpdateEmailSenderProfile).not.toHaveBeenCalled()
    expect(mockInvalidateSenderProfiles).not.toHaveBeenCalled()
  })
})

describe('createSocialLink', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const input = {
    name: 'Mastodon',
    url: 'https://mastodon.social/@smela',
    svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>'
  }

  const socialLink = {
    id: '01a08a35-63db-759e-ba12-0f9477b8b191',
    ...input,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }

  let mockDuplicate: SocialLinkRecord | undefined
  let mockFindSocialLinkByName: any
  let mockCreateSocialLink: any

  beforeEach(async () => {
    mockDuplicate = undefined

    mockFindSocialLinkByName = mock(async () => mockDuplicate)
    mockCreateSocialLink = mock(async () => socialLink)

    await moduleMocker.mock('@/data', () => ({
      systemRepo: {
        findSocialLinkByName: mockFindSocialLinkByName,
        createSocialLink: mockCreateSocialLink
      }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should create the social link when the name is free', async () => {
    const result = await createSocialLink(input)

    expect(mockFindSocialLinkByName).toHaveBeenCalledWith(input.name)
    expect(mockCreateSocialLink).toHaveBeenCalledWith(input)
    expect(result).toEqual({ socialLink })
  })

  // The name column is unique, so the guard keeps the insert from surfacing a
  // raw database error
  it('should throw and skip the insert when the name is taken', async () => {
    mockDuplicate = socialLink

    const error: any = await createSocialLink(input).catch((e: unknown) => e)

    expect(error).toMatchObject({ code: ErrorCode.Conflict })
    expect(mockCreateSocialLink).not.toHaveBeenCalled()
  })
})
