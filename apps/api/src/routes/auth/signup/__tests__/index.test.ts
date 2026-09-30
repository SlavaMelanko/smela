import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  buildMalformedRequests,
  createTestApp,
  ModuleMocker,
  post,
  testUuids,
  WEAK_PASSWORDS
} from '@/__tests__'
import {
  mockCaptchaSuccess,
  VALID_CAPTCHA_TOKEN
} from '@/middleware/captcha/__tests__'
import { HttpStatus } from '@/net/http'
import { Role, UserStatus } from '@/types'

import { signupRoute } from '../index'

describe('auth /signup', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const SIGNUP_URL = '/api/v1/auth/signup'

  const signupInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    password: 'ValidPass123!'
  }
  const validPayload = {
    ...signupInput,
    captcha: { token: VALID_CAPTCHA_TOKEN }
  }
  const deviceInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test)'
  }

  let app: Hono
  let mockSignUpWithEmail: any
  let mockSetRefreshCookie: any
  let mockGetDeviceInfo: any

  beforeEach(async () => {
    mockSignUpWithEmail = mock(async () => ({
      data: {
        user: {
          id: testUuids.USER_1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          role: Role.User,
          status: UserStatus.New,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        accessToken: 'signup-jwt-token'
      },
      refreshToken: 'refresh-token-123'
    }))

    await moduleMocker.mock('@/use-cases/auth/signup', () => ({
      signUpWithEmail: mockSignUpWithEmail
    }))

    mockSetRefreshCookie = mock(() => {})
    mockGetDeviceInfo = mock(() => deviceInfo)

    await moduleMocker.mock('@/net/http', () => ({
      HttpStatus: {
        OK: 200,
        CREATED: 201,
        INTERNAL_SERVER_ERROR: 500,
        BAD_REQUEST: 400,
        NOT_FOUND: 404
      },
      setRefreshCookie: mockSetRefreshCookie,
      getDeviceInfo: mockGetDeviceInfo
    }))

    await mockCaptchaSuccess()

    app = createTestApp('/api/v1/auth', signupRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('POST /signup', () => {
    it('should set cookie with JWT token on successful signup', async () => {
      const res = await post(app, SIGNUP_URL, validPayload)

      expect(res.status).toBe(HttpStatus.CREATED)

      const data = await res.json()
      expect(data).toEqual({
        user: {
          id: testUuids.USER_1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          role: Role.User,
          status: UserStatus.New,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        accessToken: 'signup-jwt-token'
      })

      expect(mockSetRefreshCookie).toHaveBeenCalledTimes(1)
      expect(mockSetRefreshCookie).toHaveBeenCalledWith(
        expect.any(Object),
        'refresh-token-123'
      )

      expect(mockSignUpWithEmail).toHaveBeenCalledTimes(1)
      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        signupInput,
        deviceInfo,
        undefined
      )
    })

    it('should pass preferences to use-case when provided', async () => {
      const preferences = { locale: 'uk', theme: 'dark' }

      const res = await post(app, SIGNUP_URL, { ...validPayload, preferences })

      expect(res.status).toBe(HttpStatus.CREATED)

      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        signupInput,
        deviceInfo,
        preferences
      )
    })

    it('should validate required field formats', async () => {
      const invalidData = [
        { ...validPayload, firstName: '' },
        { ...validPayload, email: 'invalid' },
        ...WEAK_PASSWORDS.map(password => ({ ...validPayload, password }))
      ]

      for (const body of invalidData) {
        const res = await post(app, SIGNUP_URL, body)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        const json = await res.json()
        expect(json).toHaveProperty('error')
      }
    })

    it('should require all required fields', async () => {
      const { firstName, lastName, email, password, captcha } = validPayload
      const incompleteRequests = [
        { lastName, email, password, captcha },
        { firstName, password, captcha },
        { firstName, lastName, email, captcha },
        { captcha },
        {}
      ]

      for (const body of incompleteRequests) {
        const res = await post(app, SIGNUP_URL, body)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        const json = await res.json()
        expect(json).toHaveProperty('error')
      }
    })

    it('should handle malformed requests', async () => {
      for (const { headers, body } of buildMalformedRequests(validPayload)) {
        const res = await post(app, SIGNUP_URL, body, headers)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      }
    })

    it('should handle signup errors and not set cookie', async () => {
      mockSignUpWithEmail.mockImplementationOnce(() => {
        throw new Error('Signup failed')
      })

      const res = await post(app, SIGNUP_URL, validPayload)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockSetRefreshCookie).not.toHaveBeenCalled()
      expect(mockSignUpWithEmail).toHaveBeenCalledTimes(1)
    })
  })
})
