import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { tokenRepo, User, userRepo } from '@/data'

import { buildUser, createTransactionMock, ModuleMocker } from '@/__tests__'
import { TokenType } from '@/security/token'
import {
  buildVerificationUrl,
  VerificationEmailMessageBuilder
} from '@/services/email'
import { UserStatus } from '@/types'

import { resendVerificationEmail } from '../resend-verification-email'

describe('resendVerificationEmail', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockUser: User
  let mockUserRepo: any
  let mockTokenRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockEmailService: any

  beforeEach(async () => {
    mockUser = buildUser({ status: UserStatus.New })

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

  it('replaces token with new verification token', async () => {
    const result = await resendVerificationEmail({ email: mockUser.email })

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)

    expect(mockTokenRepo.issue).toHaveBeenCalledWith(
      mockUser.id,
      {
        userId: mockUser.id,
        type: TokenType.EmailVerification,
        token: expect.any(String),
        expiresAt: expect.any(Date)
      },
      {}
    )
    expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)

    expect(result).toEqual({ success: true })
  })

  it('sends an email verification email with the new token', async () => {
    await resendVerificationEmail({ email: mockUser.email })

    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.any(VerificationEmailMessageBuilder)
    )
    expect(mockEmailService.send).toHaveBeenCalledTimes(1)
    expect(mockEmailService.send.mock.calls[0][0]).toMatchObject({
      data: {
        verificationUrl: buildVerificationUrl(
          mockTokenRepo.issue.mock.calls[0][1].token
        )
      }
    })
  })

  it('returns success when user does not exist', async () => {
    mockUserRepo.findByEmail.mockImplementation(async () => null)

    const result = await resendVerificationEmail({
      email: 'nonexistent@example.com'
    })

    expect(result).toEqual({ success: true })
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('returns success when user is already verified', async () => {
    const verifiedUser = {
      ...mockUser,
      status: UserStatus.Verified
    }

    mockUserRepo.findByEmail.mockImplementation(async () => verifiedUser)

    const result = await resendVerificationEmail({
      email: verifiedUser.email
    })

    expect(result).toEqual({ success: true })
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('returns success when user is suspended', async () => {
    const suspendedUser = {
      ...mockUser,
      status: UserStatus.Suspended
    }

    mockUserRepo.findByEmail.mockImplementation(async () => suspendedUser)

    const result = await resendVerificationEmail({
      email: suspendedUser.email
    })

    expect(result).toEqual({ success: true })
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('throws without sending email when token replacement fails', async () => {
    mockTokenRepo.issue.mockImplementation(async () => {
      throw new Error('Database error')
    })

    const error = await resendVerificationEmail({
      email: mockUser.email
    }).catch((error: unknown) => error)

    expect(error).toMatchObject({ message: 'Database error' })

    expect(mockTokenRepo.issue).toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('looks up email in its original case', async () => {
    const upperCaseEmail = 'JOHN@EXAMPLE.COM'
    const result = await resendVerificationEmail({ email: upperCaseEmail })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(upperCaseEmail)
    expect(result.success).toBe(true)
  })

  it('returns success without sending email for ineligible statuses', async () => {
    const ineligibleStatuses = [
      UserStatus.Trial,
      UserStatus.Active,
      UserStatus.Archived,
      UserStatus.Pending
    ]

    for (const status of ineligibleStatuses) {
      const userWithStatus = { ...mockUser, status }

      mockUserRepo.findByEmail.mockImplementation(async () => userWithStatus)

      const result = await resendVerificationEmail({
        email: userWithStatus.email
      })

      expect(result).toEqual({ success: true })
      expect(mockTokenRepo.issue).not.toHaveBeenCalled()
      expect(mockEmailService.send).not.toHaveBeenCalled()
    }
  })

  it('throws without sending email when transaction fails', async () => {
    mockTokenRepo.issue.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    const error = await resendVerificationEmail({
      email: mockUser.email
    }).catch((error: unknown) => error)

    expect(error).toMatchObject({ message: 'Database connection failed' })

    expect(mockTokenRepo.issue).toHaveBeenCalled()
    expect(mockEmailService.send).not.toHaveBeenCalled()
  })
})
