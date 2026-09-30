import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { tokenRepo, User, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { TokenType } from '@/security/token'
import {
  buildResetPasswordUrl,
  PasswordResetEmailMessageBuilder
} from '@/services/email'
import { Role, UserStatus } from '@/types'

import { requestPasswordReset } from '../request-password-reset'

describe('Request Password Reset', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockUser: User

  let mockUserRepo: any
  let mockTokenRepo: any
  let mockTransaction: any

  let mockEmailService: any

  beforeEach(async () => {
    mockUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Verified,
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockUserRepo = {
      findByEmail: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockTokenRepo = {
      issue: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockTransaction = {
      transaction: mock(async (callback: any) => callback({}) as Promise<void>)
    }

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

  describe('successful password reset request', () => {
    it('should replace token and send reset email', async () => {
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

    it('should return success when user not found', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => null)

      const result = await requestPasswordReset({
        email: 'nonexistent@example.com'
      })

      expect(result).toEqual({ success: true })
      expect(mockTokenRepo.issue).not.toHaveBeenCalled()
      expect(mockEmailService.send).not.toHaveBeenCalled()
    })
  })

  describe('non-active user scenarios', () => {
    const inactiveStatuses = [
      UserStatus.New,
      UserStatus.Suspended,
      UserStatus.Archived
    ]

    inactiveStatuses.forEach(status => {
      it(`should return success when user status is ${status}`, async () => {
        const inactiveUser = { ...mockUser, status }
        mockUserRepo.findByEmail.mockImplementation(async () => inactiveUser)

        const result = await requestPasswordReset({ email: mockUser.email })

        expect(result).toEqual({ success: true })
        expect(mockTokenRepo.issue).not.toHaveBeenCalled()
        expect(mockEmailService.send).not.toHaveBeenCalled()
      })
    })
  })

  describe('token operation failure scenarios', () => {
    it('should throw error when token replacement fails and not send email', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => mockUser)
      mockTokenRepo.issue.mockImplementation(async () => {
        throw new Error('Database connection failed')
      })

      try {
        await requestPasswordReset({ email: mockUser.email })
        expect(true).toBe(false) // should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database connection failed')
      }

      expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)
      expect(mockEmailService.send).not.toHaveBeenCalled()
    })
  })
})
