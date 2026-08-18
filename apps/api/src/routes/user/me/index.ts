import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { getRefreshCookie } from '@/net/http/cookie/refresh-token'
import { changePassword, getUser, updateUser } from '@/use-cases/user/me'

import { changePasswordSchema, updateProfileSchema } from './schema'

export const meRoute = new Hono<AppContext>()

meRoute.get('/me', async c => {
  const user = c.get('user')

  const result = await getUser(user.id)

  return c.json(result)
})

meRoute.patch('/me', validateBody(updateProfileSchema), async c => {
  const user = c.get('user')
  const body = c.req.valid('json')

  const result = await updateUser(user.id, body)

  return c.json(result)
})

meRoute.patch('/me/password', validateBody(changePasswordSchema), async c => {
  const user = c.get('user')
  const { currentPassword, newPassword } = c.req.valid('json')
  const refreshToken = getRefreshCookie(c)

  const result = await changePassword(
    user.id,
    currentPassword,
    newPassword,
    refreshToken
  )

  return c.json(result)
})
