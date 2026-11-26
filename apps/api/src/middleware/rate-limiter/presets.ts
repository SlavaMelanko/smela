import { isDevOrTestEnv } from '@/env'

import { createRateLimiter } from './core'

/**
 * Strict rate limiter for auth routes that check a password or send an email.
 *
 * - Production: 10 attempts per 15 minutes
 * - Development/Test: 1000 attempts per 15 minutes
 *
 * Apply it per route, not to the whole auth group. Routes that take an
 * unguessable token (refresh, logout, invite, verify) only need the general
 * limiter, so users behind one shared IP don't lock each other out
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDevOrTestEnv() ? 1_000 : 10,
  message: 'Too many authentication attempts, please try again later.',
  skip: c => {
    // Skip rate limiting for test environment if special header is present
    return isDevOrTestEnv() && c.req.header('X-Skip-Rate-Limit') === 'true'
  }
})

/**
 * General purpose rate limiter for most API endpoints.
 *
 * - Production: 100 requests per 15 minutes
 * - Development/Test: 1000 requests per 15 minutes
 *
 * Use for regular API endpoints that don't need strict limiting.
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDevOrTestEnv() ? 1_000 : 100,
  skip: c => {
    // Skip rate limiting for test environment if special header is present
    return isDevOrTestEnv() && c.req.header('X-Skip-Rate-Limit') === 'true'
  }
})
