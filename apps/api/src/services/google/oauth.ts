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

const requireGoogleEnv = () => {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URI
  ) {
    throw new AppError(
      ErrorCode.InternalError,
      'Google OAuth is not configured'
    )
  }

  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI
  }
}

export const buildAuthUrl = (state: string): string => {
  const { clientId, redirectUri } = requireGoogleEnv()

  const params = new URLSearchParams({
    client_id: clientId, // identifies our app to Google
    redirect_uri: redirectUri, // where Google sends the user after auth
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

const fetchGoogleTokens = async (
  code: string
): Promise<GoogleTokenResponse> => {
  const { clientId, clientSecret, redirectUri } = requireGoogleEnv()

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  })

  if (!res.ok) {
    throw new AppError(
      ErrorCode.InvalidCredentials,
      'Google token exchange failed'
    )
  }

  return res.json() as Promise<GoogleTokenResponse>
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

  return res.json() as Promise<GoogleUserInfo>
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
