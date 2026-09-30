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

describe('Resend Verification Email', () => {
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

  describe('when user exists and is not verified', () => {
    it('should replace token with new verification token', async () => {
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

    it('should send an email verification email with the new token', async () => {
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
  })

  describe('when user does not exist', () => {
    it('should return success response to prevent email enumeration', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => null)

      const result = await resendVerificationEmail({
        email: 'nonexistent@example.com'
      })

      expect(result).toEqual({ success: true })
      expect(mockTokenRepo.issue).not.toHaveBeenCalled()
      expect(mockEmailService.send).not.toHaveBeenCalled()
    })
  })

  describe('when user is already verified', () => {
    it('should return success response to prevent email enumeration', async () => {
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
  })

  describe('when user is suspended', () => {
    it('should return success response to prevent email enumeration', async () => {
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
  })

  describe('when token replacement fails', () => {
    it('should throw the error and not send email', async () => {
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
  })

  describe('edge cases', () => {
    it('should handle email with different cases', async () => {
      const upperCaseEmail = 'JOHN@EXAMPLE.COM'
      const result = await resendVerificationEmail({ email: upperCaseEmail })

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(upperCaseEmail)
      expect(result.success).toBe(true)
    })

    it('should reject users with ineligible statuses to prevent enumeration', async () => {
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
  })

  describe('when replace fails due to transaction error', () => {
    it('should throw the error and not send email', async () => {
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
})
