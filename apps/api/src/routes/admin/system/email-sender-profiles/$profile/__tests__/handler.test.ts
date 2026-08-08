import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { EmailSenderProfile } from '@/types'

import {
  getEmailSenderProfileHandler,
  updateEmailSenderProfileHandler
} from '../handler'

const mockSenderProfile: EmailSenderProfileRecord = {
  profile: EmailSenderProfile.System,
  email: 'noreply@smela.me',
  name: 'SMELA',
  description: 'Transactional and system notifications',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('getEmailSenderProfileHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockGetEmailSenderProfile: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: {
        valid: mock(() => ({ profile: EmailSenderProfile.System }))
      },
      json: mockJson
    }

    mockGetEmailSenderProfile = mock(async () => ({
      senderProfile: mockSenderProfile
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getEmailSenderProfile: mockGetEmailSenderProfile
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should call getEmailSenderProfile with the profile param and return OK status', async () => {
    const result = await getEmailSenderProfileHandler(mockContext)

    expect(mockGetEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderProfile.System
    )
    expect(mockJson).toHaveBeenCalledWith(
      { senderProfile: mockSenderProfile },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when getEmailSenderProfile throws', async () => {
    mockGetEmailSenderProfile.mockImplementation(async () => {
      throw new Error('Email sender profile not found')
    })

    expect(getEmailSenderProfileHandler(mockContext)).rejects.toThrow(
      'Email sender profile not found'
    )
  })
})

describe('updateEmailSenderProfileHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockUpdateEmailSenderProfile: any

  const updates = { name: 'SMELA Updated' }

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: {
        valid: mock((target: string) =>
          target === 'param' ? { profile: EmailSenderProfile.System } : updates
        )
      },
      json: mockJson
    }

    mockUpdateEmailSenderProfile = mock(async () => ({
      senderProfile: { ...mockSenderProfile, ...updates }
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      updateEmailSenderProfile: mockUpdateEmailSenderProfile
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should pass the profile param and body to updateEmailSenderProfile', async () => {
    const result = await updateEmailSenderProfileHandler(mockContext)

    expect(mockUpdateEmailSenderProfile).toHaveBeenCalledWith(
      EmailSenderProfile.System,
      updates
    )
    expect(mockJson).toHaveBeenCalledWith(
      { senderProfile: { ...mockSenderProfile, ...updates } },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when updateEmailSenderProfile throws', async () => {
    mockUpdateEmailSenderProfile.mockImplementation(async () => {
      throw new Error('Email sender profile not found')
    })

    expect(updateEmailSenderProfileHandler(mockContext)).rejects.toThrow(
      'Email sender profile not found'
    )
  })
})
