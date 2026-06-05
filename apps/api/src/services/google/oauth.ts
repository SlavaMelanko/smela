import { z } from 'zod'

import env from '@/env'
import { AppError, ErrorCode } from '@/errors'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export interface GoogleProfile {
  id: string
  email: string
  firstName: string
  lastName?: string
}

export const buildAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID, // identifies our app to Google
    redirect_uri: env.GOOGLE_REDIRECT_URI, // where Google sends the user after auth
    response_type: 'code', // authorization code flow — code is exchanged server-side for tokens
    scope: 'openid email profile', // request email and basic profile (name)
    access_type: 'offline', // include refresh token in response
    state // CSRF nonce — verified in the callback to prevent forged requests
  })

  return `${AUTH_URL}?${params}`
}

const googleTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string()
})

const googleUserInfoSchema = z.object({
  sub: z.string(), // stable unique identifier per OpenID Connect spec
  email: z.email(),
  given_name: z.string(),
  family_name: z.string().optional(),
  email_verified: z.boolean()
})

const fetchGoogleTokens = async (code: string) => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  })

  if (!res.ok) {
    throw new AppError(
      ErrorCode.GoogleOAuthFailed,
      'Google token exchange failed'
    )
  }

  const parsed = googleTokenSchema.safeParse(await res.json())

  if (!parsed.success) {
    throw new AppError(
      ErrorCode.GoogleOAuthFailed,
      'Unexpected Google token response'
    )
  }

  return parsed.data
}

const fetchGoogleUserInfo = async (accessToken: string) => {
  const res = await fetch(USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!res.ok) {
    throw new AppError(
      ErrorCode.GoogleOAuthFailed,
      'Failed to fetch Google user info'
    )
  }

  const parsed = googleUserInfoSchema.safeParse(await res.json())

  if (!parsed.success) {
    throw new AppError(
      ErrorCode.GoogleOAuthFailed,
      'Unexpected Google user info response'
    )
  }

  return parsed.data
}

export const exchangeCodeForProfile = async (
  code: string
): Promise<GoogleProfile> => {
  const tokens = await fetchGoogleTokens(code)
  const userInfo = await fetchGoogleUserInfo(tokens.access_token)

  if (!userInfo.email_verified) {
    throw new AppError(
      ErrorCode.GoogleEmailNotVerified,
      'Google email not verified'
    )
  }

  return {
    id: userInfo.sub,
    email: userInfo.email,
    firstName: userInfo.given_name,
    lastName: userInfo.family_name
  }
}
