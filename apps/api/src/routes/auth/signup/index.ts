import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'
import { getDeviceInfo, HttpStatus, setRefreshCookie } from '@/net/http'
import { signUpWithEmail } from '@/use-cases/auth/signup'

import { signupBodySchema } from './schema'

export const signupRoute = new Hono<AppContext>()

signupRoute.post(
  '/signup',
  validateBody(signupBodySchema),
  verifyCaptcha(),
  async c => {
    const { firstName, lastName, email, password, preferences } =
      c.req.valid('json')
    const deviceInfo = getDeviceInfo(c)

    const result = await signUpWithEmail(
      { firstName, lastName, email, password },
      deviceInfo,
      preferences
    )

    setRefreshCookie(c, result.refreshToken)

    return c.json(result.data, HttpStatus.CREATED)
  }
)
