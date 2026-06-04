import { z } from 'zod'

export const captchaEnvVars = {
  CAPTCHA_SECRET_KEY: z
    .string()
    .regex(/^[\w-]{40}$/, 'Invalid reCAPTCHA secret key format')
}

export const sentryEnvVars = {
  SENTRY_DSN: z.url().optional()
}

export const googleOAuthEnvVars = {
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url()
}
