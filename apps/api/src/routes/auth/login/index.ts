import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'
import { getDeviceInfo, HttpStatus, setRefreshCookie } from '@/net/http'
import { logInWithEmail } from '@/use-cases/auth/login'

import { loginBodySchema } from './schema'

export const loginRoute = new Hono<AppContext>()

loginRoute.post(
  '/login',
  validateBody(loginBodySchema),
  verifyCaptcha(),
  async c => {
    const { email, password } = c.req.valid('json')
    const deviceInfo = getDeviceInfo(c)

    const result = await logInWithEmail({ email, password }, deviceInfo)

    setRefreshCookie(c, result.refreshToken)

    return c.json(result.data, HttpStatus.OK)
  }
)
