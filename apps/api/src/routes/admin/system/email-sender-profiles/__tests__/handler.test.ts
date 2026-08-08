import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { EmailSenderProfile } from '@/types'

import { getEmailSenderProfilesHandler } from '../handler'

describe('getEmailSenderProfilesHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockGetEmailSenderProfiles: any

  const mockSenderProfiles: EmailSenderProfileRecord[] = [
    {
      profile: EmailSenderProfile.System,
      email: 'noreply@smela.me',
      name: 'SMELA',
      description: 'Transactional and system notifications',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = { json: mockJson }

    mockGetEmailSenderProfiles = mock(async () => ({
      senderProfiles: mockSenderProfiles
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getEmailSenderProfiles: mockGetEmailSenderProfiles
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should call getEmailSenderProfiles and return profiles with OK status', async () => {
    const result = await getEmailSenderProfilesHandler(mockContext)

    expect(mockGetEmailSenderProfiles).toHaveBeenCalled()
    expect(mockJson).toHaveBeenCalledWith(
      { senderProfiles: mockSenderProfiles },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when getEmailSenderProfiles throws', async () => {
    mockGetEmailSenderProfiles.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    expect(getEmailSenderProfilesHandler(mockContext)).rejects.toThrow(
      'Database connection failed'
    )
  })
})
