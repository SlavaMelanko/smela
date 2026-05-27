import type { MiddlewareHandler } from 'hono'

import { secureHeaders as honoSecureHeaders } from 'hono/secure-headers'

import { createSecureHeadersConfig } from './config'

export const secureHeaders: MiddlewareHandler = honoSecureHeaders(
  createSecureHeadersConfig()
)
