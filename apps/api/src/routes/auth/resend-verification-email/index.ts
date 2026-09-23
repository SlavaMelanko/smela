import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { resendVerificationEmail } from '@/use-cases/auth/resend-verification-email'

import { resendVerificationEmailBodySchema } from './schema'

export const resendVerificationEmailRoute = new Hono<AppContext>()

resendVerificationEmailRoute.post(
  '/resend-verification-email',
  validateBody(resendVerificationEmailBodySchema),
  verifyCaptcha(),
  async c => {
    const { email, preferences } = c.req.valid('json')

    const result = await resendVerificationEmail({ email }, preferences)

    return c.json(result, HttpStatus.ACCEPTED)
  }
)
