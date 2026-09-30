import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { refreshTokenRepo } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { hashToken } from '@/security/token'

import { logout } from '../logout'

describe('Logout Use Case', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockRefreshTokenRepo: any

  beforeEach(async () => {
    mockRefreshTokenRepo = {
      revokeByHash: mock(async () => true)
    } satisfies Partial<typeof refreshTokenRepo>

    await moduleMocker.mock('@/data', () => ({
      refreshTokenRepo: mockRefreshTokenRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('successful logout', () => {
    it('should revoke the hash of the refresh token', async () => {
      const refreshToken = 'valid_refresh_token'

      const result = await logout(refreshToken)

      expect(result).toBeUndefined()
      expect(mockRefreshTokenRepo.revokeByHash).toHaveBeenCalledTimes(1)
      expect(mockRefreshTokenRepo.revokeByHash).toHaveBeenCalledWith(
        await hashToken(refreshToken)
      )
    })

    it('should revoke tokens with special characters', async () => {
      const specialTokens = [
        '!@#$%^&*()_+-=[]{}|;:,.<>?',
        'token with spaces',
        '😀🔑💻🚀',
        'токен_кириллица'
      ]

      for (const token of specialTokens) {
        await logout(token)

        expect(mockRefreshTokenRepo.revokeByHash).toHaveBeenCalledWith(
          await hashToken(token)
        )
      }

      expect(mockRefreshTokenRepo.revokeByHash).toHaveBeenCalledTimes(
        specialTokens.length
      )
    })
  })

  describe('early return scenarios', () => {
    it('should skip revocation when refresh token is missing', async () => {
      const missingTokens = [undefined, null, '']

      for (const token of missingTokens) {
        const result = await logout(token as any)

        expect(result).toBeUndefined()
      }

      expect(mockRefreshTokenRepo.revokeByHash).not.toHaveBeenCalled()
    })

    it('should skip revocation for whitespace-only tokens', async () => {
      await logout('   ')

      expect(mockRefreshTokenRepo.revokeByHash).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should propagate error when repository revocation fails', async () => {
      mockRefreshTokenRepo.revokeByHash.mockImplementation(async () => {
        throw new Error('Database revocation failed')
      })

      expect(logout('valid_refresh_token')).rejects.toThrow(
        'Database revocation failed'
      )
    })
  })
})
