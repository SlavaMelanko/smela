import type { ValidationTargets } from 'hono'
import type { ZodType } from 'zod'

import { zValidator } from '@hono/zod-validator'

import { AppError, ErrorCode } from '@/errors'
import { logger } from '@/logging'

const validate = <
  Target extends keyof ValidationTargets,
  Schema extends ZodType
>(
  target: Target,
  schema: Schema
) =>
  zValidator(target, schema, (result, _c) => {
    if (!result.success) {
      const { issues } = result.error

      logger.error(issues)

      throw new AppError(ErrorCode.ValidationError, JSON.stringify(issues))
    }
  })

export const validateBody = <Schema extends ZodType>(schema: Schema) =>
  validate('json', schema)

export const validateParams = <Schema extends ZodType>(schema: Schema) =>
  validate('param', schema)

export const validateQuery = <Schema extends ZodType>(schema: Schema) =>
  validate('query', schema)
