import type { MiddlewareHandler } from 'hono'

import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { onError } from '@/handlers'

export const makeAuthApp = (middleware: MiddlewareHandler, path: string) => {
  const app = new Hono<AppContext>()
  app.onError(onError)
  app.use(path, middleware)
  app.get(path, c => c.json({ message: 'success' }))

  const get = async (token?: string) =>
    app.request(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

  return { app, get }
}
