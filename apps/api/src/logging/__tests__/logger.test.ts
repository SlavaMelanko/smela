import { describe, expect, it } from 'bun:test'

import { env } from '@/env'

import logger from '../logger'

describe('logger', () => {
  it('uses the configured log level', () => {
    expect(logger.level).toBe(env.LOG_LEVEL)
  })

  it('filters out levels below the configured one', () => {
    expect(logger.isLevelEnabled(env.LOG_LEVEL)).toBe(true)
    expect(logger.isLevelEnabled('trace')).toBe(false)
  })
})
