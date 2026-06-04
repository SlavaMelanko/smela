import env from '@/env'
import { AppError, ErrorCode } from '@/errors'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
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

interface GoogleTokenResponse {
  access_token: string
  token_type: string
}

interface GoogleUserInfo {
  id: string
  email: string
  given_name: string
  family_name?: string
  verified_email: boolean
}

const validateTokenResponse = (data: unknown): GoogleTokenResponse => {
  if (!data || typeof data !== 'object') {
    throw new AppError(
      ErrorCode.InternalError,
      'Invalid token response from Google'
    )
  }

  const response = data as Record<string, unknown>
  
  if (typeof response.access_token !== 'string' || !response.access_token) {
    throw new AppError(
      ErrorCode.InternalError,
      'Missing access token in Google response'
    )
  }

  if (typeof response.token_type !== 'string') {
    throw new AppError(
      ErrorCode.InternalError,
      'Missing token type in Google response'
    )
  }

  return {
    access_token: response.access_token,
    token_type: response.token_type
  }
}

const validateUserInfo = (data: unknown): GoogleUserInfo => {
  if (!data || typeof data !== 'object') {
    throw new AppError(
      ErrorCode.InternalError,
      'Invalid user info response from Google'
    )
  }

  const userInfo = data as Record<string, unknown>
  
  if (typeof userInfo.id !== 'string' || !userInfo.id) {
    throw new AppError(
      ErrorCode.InternalError,
      'Missing user ID in Google response'
    )
  }

  if (typeof userInfo.email !== 'string' || !userInfo.email) {
    throw new AppError(
      ErrorCode.InternalError,
      'Missing email in Google response'
    )
  }

  if (typeof userInfo.given_name !== 'string' || !userInfo.given_name) {
    throw new AppError(
      ErrorCode.InternalError,
      'Missing given name in Google response'
    )
  }

  return {
    id: userInfo.id,
    email: userInfo.email,
    given_name: userInfo.given_name,
    family_name: typeof userInfo.family_name === 'string' ? userInfo.family_name : undefined,
    verified_email: userInfo.verified_email === true
  }
}

const fetchGoogleTokens = async (
  code: string
): Promise<GoogleTokenResponse> => {
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
      ErrorCode.InvalidCredentials,
      'Google token exchange failed'
    )
  }

  const data = await res.json()
  return validateTokenResponse(data)
}

const fetchGoogleUserInfo = async (
  accessToken: string
): Promise<GoogleUserInfo> => {
  const res = await fetch(USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!res.ok) {
    throw new AppError(
      ErrorCode.InvalidCredentials,
      'Failed to fetch Google user info'
    )
  }

  const data = await res.json()
  return validateUserInfo(data)
}

export const exchangeCodeForProfile = async (
  code: string
): Promise<GoogleProfile> => {
  const tokens = await fetchGoogleTokens(code)
  const userInfo = await fetchGoogleUserInfo(tokens.access_token)

  if (!userInfo.verified_email) {
    throw new AppError(
      ErrorCode.InvalidCredentials,
      'Google email not verified'
    )
  }

  return {
    id: userInfo.id,
    email: userInfo.email,
    firstName: userInfo.given_name,
    lastName: userInfo.family_name
  }
}
