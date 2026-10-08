import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { HTTPException } from 'hono/http-exception'

import { isDevEnv } from '@/env'
import { APP_ERROR_NAME, AppError, ErrorCode, ErrorRegistry } from '@/errors'
import { logger } from '@/logging'
import { HttpStatus } from '@/net/http'
import { getErrorTracker } from '@/services'

// Only AppError and HTTPException carry client-safe messages. Any other error
// (e.g. a database or network failure) may expose internals, so it gets the generic one
const toPublicError = (err: Error): { code: ErrorCode; message: string } => {
  if (err instanceof AppError) {
    return { code: err.code, message: err.message }
  }

  if (err instanceof HTTPException) {
    const code =
      err.status >= HttpStatus.BAD_REQUEST &&
      err.status < HttpStatus.INTERNAL_SERVER_ERROR
        ? ErrorCode.BadRequest
        : ErrorCode.InternalError

    return { code, message: err.message || ErrorRegistry[code].message }
  }

  const code = ErrorCode.InternalError

  return { code, message: ErrorRegistry[code].message }
}

const onError: ErrorHandler = (err, c) => {
  logger.error(err)

  getErrorTracker().captureError(err)

  const { code, message } = toPublicError(err)
  const { status } = ErrorRegistry[code]
  const stack = isDevEnv() ? err.stack : undefined

  return c.json(
    {
      name: APP_ERROR_NAME,
      code,
      error: message,
      stack
    },
    status as ContentfulStatusCode
  )
}

export default onError
