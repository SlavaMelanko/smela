import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  EmailSenderProfileRecord,
  SocialLinkRecord,
  systemRepo
} from '@/data'
import type { emailService } from '@/services/email'

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
  let mockSystemRepo: any

  beforeEach(async () => {
    mockSenderProfiles = [buildSenderProfile()]

    mockSystemRepo = {
      listEmailSenderProfiles: mock(async () => mockSenderProfiles)
    } satisfies Partial<typeof systemRepo>

    await moduleMocker.mock('@/data', () => ({
      systemRepo: mockSystemRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns all sender profiles', async () => {
    const result = await getEmailSenderProfiles()

    expect(mockSystemRepo.listEmailSenderProfiles).toHaveBeenCalled()
    expect(result).toEqual({ senderProfiles: mockSenderProfiles })
  })
})

describe('getEmailSenderProfile', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockSenderProfile: EmailSenderProfileRecord | undefined
  let mockSystemRepo: any

  const senderProfile = buildSenderProfile()

  beforeEach(async () => {
    mockSenderProfile = senderProfile

    mockSystemRepo = {
      findEmailSenderProfile: mock(async () => mockSenderProfile)
    } satisfies Partial<typeof systemRepo>

    await moduleMocker.mock('@/data', () => ({
      systemRepo: mockSystemRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns the requested sender profile', async () => {
    const result = await getEmailSenderProfile(EmailSenderType.System)

    expect(mockSystemRepo.findEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderType.System
    )
    expect(result).toEqual({ senderProfile })
  })

  it('throws NotFound when sender profile is missing', async () => {
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
  let mockSystemRepo: any
  let mockEmailService: any

  beforeEach(async () => {
    mockSenderProfile = buildSenderProfile()
    mockUpdatedSenderProfile = buildSenderProfile({ name: 'SMELA Updated' })

    mockSystemRepo = {
      findEmailSenderProfile: mock(async () => mockSenderProfile),
      updateEmailSenderProfile: mock(async () => mockUpdatedSenderProfile)
    } satisfies Partial<typeof systemRepo>
    mockEmailService = {
      invalidateSenderProfiles: mock(() => {})
    } satisfies Partial<typeof emailService>

    await moduleMocker.mock('@/data', () => ({
      systemRepo: mockSystemRepo
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('updates the sender profile', async () => {
    const updates = { name: 'SMELA Updated' }

    const result = await updateEmailSenderProfile(
      EmailSenderType.System,
      updates
    )

    expect(mockSystemRepo.updateEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderType.System,
      updates
    )
    expect(result).toEqual({ senderProfile: mockUpdatedSenderProfile })
  })

  it('invalidates cached sender profiles after updating', async () => {
    await updateEmailSenderProfile(EmailSenderType.System, { name: 'SMELA' })

    expect(mockEmailService.invalidateSenderProfiles).toHaveBeenCalled()
  })

  it('throws NotFound and skips update when sender profile is missing', async () => {
    mockSenderProfile = undefined

    const error: any = await updateEmailSenderProfile(EmailSenderType.Support, {
      name: 'Nope'
    }).catch((e: unknown) => e)

    expect(error).toMatchObject({ code: ErrorCode.NotFound })
    expect(mockSystemRepo.updateEmailSenderProfile).not.toHaveBeenCalled()
    expect(mockEmailService.invalidateSenderProfiles).not.toHaveBeenCalled()
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
  let mockSystemRepo: any

  beforeEach(async () => {
    mockDuplicate = undefined

    mockSystemRepo = {
      findSocialLinkByName: mock(async () => mockDuplicate),
      createSocialLink: mock(async () => socialLink)
    } satisfies Partial<typeof systemRepo>

    await moduleMocker.mock('@/data', () => ({
      systemRepo: mockSystemRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('creates the social link when name is free', async () => {
    const result = await createSocialLink(input)

    expect(mockSystemRepo.findSocialLinkByName).toHaveBeenCalledWith(input.name)
    expect(mockSystemRepo.createSocialLink).toHaveBeenCalledWith(input)
    expect(result).toEqual({ socialLink })
  })

  // The name column is unique, so the guard keeps the insert from surfacing a
  // raw database error
  it('throws Conflict and skips insert when name is taken', async () => {
    mockDuplicate = socialLink

    const error: any = await createSocialLink(input).catch((e: unknown) => e)

    expect(error).toMatchObject({ code: ErrorCode.Conflict })
    expect(mockSystemRepo.createSocialLink).not.toHaveBeenCalled()
  })
})
