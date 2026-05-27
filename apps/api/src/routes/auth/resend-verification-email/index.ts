import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { captchaMiddleware, validateBody } from '@/middleware'

import { resendVerificationEmailHandler } from './handler'
import { resendVerificationEmailBodySchema } from './schema'

export const resendVerificationEmailRoute = new Hono<AppContext>()

resendVerificationEmailRoute.post(
  '/resend-verification-email',
  validateBody(resendVerificationEmailBodySchema),
  captchaMiddleware(),
  resendVerificationEmailHandler
)
