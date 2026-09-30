import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'

import env from '@/env'
import { ErrorCode } from '@/errors'
import HttpStatus from '@/net/http/status'

import { buildAuthUrl, exchangeCodeForProfile } from '../oauth'

const tokenResponse = {
  access_token: 'google-access-token',
  token_type: 'Bearer'
}

const userInfoResponse = {
  sub: 'google-user-123',
  email: 'john@example.com',
  given_name: 'John',
  family_name: 'Doe',
  email_verified: true
}

const errorResponse = () =>
  new Response(null, { status: HttpStatus.INTERNAL_SERVER_ERROR })

describe('oauth', () => {
  let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, 'fetch'>>

  // Queues one response per fetch call: token exchange first, then user info
  const mockResponses = (...responses: Response[]) => {
    responses.forEach(response => fetchSpy.mockResolvedValueOnce(response))
  }

  beforeEach(() => {
    fetchSpy = spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('buildAuthUrl', () => {
    it('includes the client, redirect URI and state', () => {
      const url = new URL(buildAuthUrl('state-nonce'))

      expect(url.searchParams.get('client_id')).toBe(env.GOOGLE_CLIENT_ID)
      expect(url.searchParams.get('redirect_uri')).toBe(env.GOOGLE_REDIRECT_URI)
      expect(url.searchParams.get('state')).toBe('state-nonce')
    })
  })

  describe('exchangeCodeForProfile', () => {
    it('exchanges the code for tokens and maps user info to a profile', async () => {
      mockResponses(
        Response.json(tokenResponse),
        Response.json(userInfoResponse)
      )

      const profile = await exchangeCodeForProfile('auth-code')

      expect(profile).toEqual({
        id: 'google-user-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe'
      })

      const [[, tokenRequest], [, userInfoRequest]] = fetchSpy.mock.calls
      const tokenBody = tokenRequest?.body as URLSearchParams
      expect(tokenBody.get('code')).toBe('auth-code')
      expect(tokenBody.get('client_secret')).toBe(env.GOOGLE_CLIENT_SECRET)
      expect(userInfoRequest?.headers).toEqual({
        Authorization: 'Bearer google-access-token'
      })
    })

    const failures = [
      {
        name: 'token exchange fails',
        responses: () => [errorResponse()],
        error: 'Google token exchange failed'
      },
      {
        name: 'token response is malformed',
        responses: () => [Response.json({ token_type: 'Bearer' })],
        error: 'Unexpected Google token response'
      },
      {
        name: 'user info request fails',
        responses: () => [Response.json(tokenResponse), errorResponse()],
        error: 'Failed to fetch Google user info'
      },
      {
        name: 'user info response is malformed',
        responses: () => [
          Response.json(tokenResponse),
          Response.json({ ...userInfoResponse, email: 'not-an-email' })
        ],
        error: 'Unexpected Google user info response'
      }
    ]

    failures.forEach(({ name, responses, error: message }) => {
      it(`throws when ${name}`, async () => {
        mockResponses(...responses())

        const error = await exchangeCodeForProfile('auth-code').catch(
          (error: unknown) => error
        )

        expect(error).toMatchObject({
          code: ErrorCode.GoogleOAuthFailed,
          message
        })
      })
    })

    it('rejects an unverified Google email', async () => {
      mockResponses(
        Response.json(tokenResponse),
        Response.json({ ...userInfoResponse, email_verified: false })
      )

      const error = await exchangeCodeForProfile('auth-code').catch(
        (error: unknown) => error
      )

      expect(error).toMatchObject({ code: ErrorCode.GoogleEmailNotVerified })
    })
  })
})
