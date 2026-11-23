import type { Context, MiddlewareHandler } from 'hono'

import { rateLimiter } from 'hono-rate-limiter'

import { isDevOrTestEnv } from '@/env'
import { getClientIp } from '@/net/http'

import type { RateLimiterConfig } from './config'

const getClientIpKey = (c: Context) => getClientIp(c) ?? 'unknown-ip'

/**
 * Creates a rate limiter middleware with the specified configuration.
 *
 * @param config - Configuration options for the rate limiter
 * @returns Hono middleware handler for rate limiting
 */
export const createRateLimiter = (
  config: RateLimiterConfig = {}
): MiddlewareHandler => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    limit = config.limit ?? (isDevOrTestEnv() ? 1_000 : 100),
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = getClientIpKey,
    skip
  } = config

  return rateLimiter({
    windowMs,
    limit,
    message,
    statusCode,
    keyGenerator,
    skip,
    standardHeaders: 'draft-6' // add standard rate limit headers
  })
}
