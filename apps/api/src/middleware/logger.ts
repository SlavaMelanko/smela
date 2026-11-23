import { pinoLogger } from 'hono-pino'

import { logger } from '@/logging'

// Default bindings log all headers, which leak bearer tokens (Authorization),
// refresh tokens (Cookie, Set-Cookie), and other credentials
export const requestLogger = pinoLogger({
  pino: logger,
  http: {
    onReqBindings: c => ({ req: { url: c.req.path, method: c.req.method } }),
    onResBindings: c => ({ res: { status: c.res.status } })
  }
})
