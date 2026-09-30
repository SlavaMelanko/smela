import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { tokenRepo, User, userRepo } from '@/data'

import { buildUser, createTransactionMock, ModuleMocker } from '@/__tests__'
import { TokenType } from '@/security/token'
import {
  buildResetPasswordUrl,
  PasswordResetEmailMessageBuilder
} from '@/services/email'
import { UserStatus } from '@/types'

import { requestPasswordReset } from '../request-password-reset'

describe('requestPasswordReset', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockUser: User

  let mockUserRepo: any
  let mockTokenRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockEmailService: any

  beforeEach(async () => {
    mockUser = buildUser()
    mockUserRepo = {
      findByEmail: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockTokenRepo = {
      issue: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockTransaction = createTransactionMock()

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      tokenRepo: mockTokenRepo,
      db: mockTransaction
    }))

    mockEmailService = {
      send: mock(async () => ({ provider: 'ethereal', messageId: 'test-id' }))
    }

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('replaces token and sends reset email', async () => {
    const result = await requestPasswordReset({ email: mockUser.email })

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)

    // Replace token should be called
    expect(mockTokenRepo.issue).toHaveBeenCalledWith(
      mockUser.id,
      {
        userId: mockUser.id,
        type: TokenType.PasswordReset,
        token: expect.any(String),
        expiresAt: expect.any(Date)
      },
      {}
    )
    expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)

    // Send reset email
    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.any(PasswordResetEmailMessageBuilder)
    )
    expect(mockEmailService.send).toHaveBeenCalledTimes(1)
    expect(mockEmailService.send.mock.calls[0][0]).toMatchObject({
      data: {
        resetUrl: buildResetPasswordUrl(
          mockUser.role,
          mockTokenRepo.issue.mock.calls[0][1].token
        )
      }
    })

    expect(result).toEqual({ success: true })
  })

  it('returns success without sending email when user is not found', async () => {
    mockUserRepo.findByEmail.mockImplementation(async () => null)

    const result = await requestPasswordReset({
      email: 'nonexistent@example.com'
    })

    expect(result).toEqual({ success: true })
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  describe('when user is not active', () => {
    const inactiveStatuses = [
      UserStatus.New,
      UserStatus.Suspended,
      UserStatus.Archived
    ]

    inactiveStatuses.forEach(status => {
      it(`returns success without sending email when user status is ${status}`, async () => {
        const inactiveUser = { ...mockUser, status }
        mockUserRepo.findByEmail.mockImplementation(async () => inactiveUser)

        const result = await requestPasswordReset({ email: mockUser.email })

        expect(result).toEqual({ success: true })
        expect(mockTokenRepo.issue).not.toHaveBeenCalled()
        expect(mockEmailService.send).not.toHaveBeenCalled()
      })
    })
  })

  it('throws without sending email when token replacement fails', async () => {
    mockUserRepo.findByEmail.mockImplementation(async () => mockUser)
    mockTokenRepo.issue.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    const error = await requestPasswordReset({ email: mockUser.email }).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Database connection failed' })

    expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })
})
