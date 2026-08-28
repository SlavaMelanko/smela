import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { EmailSenderProfile } from '@/services/email'

import {
  getEmailSenderProfile,
  getEmailSenderProfiles,
  updateEmailSenderProfile
} from '../system'

const buildSenderProfile = (
  overrides: Partial<EmailSenderProfileRecord> = {}
): EmailSenderProfileRecord => ({
  profile: EmailSenderProfile.System,
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
    const result = await getEmailSenderProfile(EmailSenderProfile.System)

    expect(mockFindEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderProfile.System
    )
    expect(result).toEqual({ senderProfile })
  })

  it('should throw when the sender profile does not exist', async () => {
    mockSenderProfile = undefined

    expect(
      getEmailSenderProfile(EmailSenderProfile.Support)
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
      emailAgent: { invalidateSenderProfiles: mockInvalidateSenderProfiles }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should update the sender profile', async () => {
    const updates = { name: 'SMELA Updated' }

    const result = await updateEmailSenderProfile(
      EmailSenderProfile.System,
      updates
    )

    expect(mockUpdateEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderProfile.System,
      updates
    )
    expect(result).toEqual({ senderProfile: mockUpdatedSenderProfile })
  })

  it('should invalidate the cached sender profiles after updating', async () => {
    await updateEmailSenderProfile(EmailSenderProfile.System, { name: 'SMELA' })

    expect(mockInvalidateSenderProfiles).toHaveBeenCalled()
  })

  it('should not update when the sender profile does not exist', async () => {
    mockSenderProfile = undefined

    const error: any = await updateEmailSenderProfile(
      EmailSenderProfile.Support,
      { name: 'Nope' }
    ).catch((e: unknown) => e)

    expect(error).toMatchObject({ code: ErrorCode.NotFound })
    expect(mockUpdateEmailSenderProfile).not.toHaveBeenCalled()
    expect(mockInvalidateSenderProfiles).not.toHaveBeenCalled()
  })
})
