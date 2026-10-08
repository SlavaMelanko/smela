import type { NotFoundHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { AppContext } from '@/context'

import { APP_ERROR_NAME, ErrorCode, ErrorRegistry } from '@/errors'
import { getErrorTracker } from '@/services'

export const notFound: NotFoundHandler<AppContext> = c => {
  const code = ErrorCode.NotFound
  const { message, status } = ErrorRegistry[code]
  const path = c.req.path

  getErrorTracker().captureMessage(`Not found: ${path}`, 'warning')

  return c.json(
    {
      name: APP_ERROR_NAME,
      code,
      error: message,
      path
    },
    status as ContentfulStatusCode
  )
}
