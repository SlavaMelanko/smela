// Client-side form validation (UX only, not the enforced boundary).
// Server-side counterpart: apps/api/src/routes/rules.ts
import { z } from 'zod'

import { allUserStatuses } from '../types/index.js'
import {
  DescriptionConstraint,
  EmailConstraint,
  isHttpsUrl,
  NameConstraint,
  PasswordConstraint,
  PositionConstraint,
  SvgConstraint,
  WebsiteConstraint
} from './constants'

const requiredStr = errorMessage => z.string().trim().nonempty(errorMessage)

const optionalStr = () =>
  z
    .string()
    .trim()
    .transform(v => v || undefined)
    .pipe(z.string().optional())

export const firstName = requiredStr('firstName.error.required')
  .min(NameConstraint.MIN_LENGTH, 'firstName.error.min')
  .max(NameConstraint.MAX_LENGTH, 'firstName.error.max')

export const lastName = {
  required: requiredStr('lastName.error.required')
    .min(NameConstraint.MIN_LENGTH, 'lastName.error.min')
    .max(NameConstraint.MAX_LENGTH, 'lastName.error.max'),

  // Optional version - validates when provided but not required
  optional: optionalStr()
    .refine(
      value => !value || value.length >= NameConstraint.MIN_LENGTH,
      'lastName.error.min'
    )
    .refine(
      value => !value || value.length <= NameConstraint.MAX_LENGTH,
      'lastName.error.max'
    )
}

export const email = {
  new: requiredStr('email.error.required')
    .max(EmailConstraint.MAX_LENGTH, 'email.error.max')
    .regex(EmailConstraint.STANDARD, 'email.error.format')
}

export const captcha = requiredStr('captcha.error')

export const password = {
  new: requiredStr('password.error.required')
    .min(PasswordConstraint.MIN_LENGTH, 'password.error.min')
    .max(PasswordConstraint.MAX_LENGTH, 'password.error.max')
    .regex(PasswordConstraint.STRONG, 'password.error.strong')
}

export const url = {
  optional: optionalStr()
    .refine(
      value => value === undefined || isHttpsUrl(value),
      'url.error.format'
    )
    .refine(
      value =>
        value === undefined || value.length <= WebsiteConstraint.MAX_LENGTH,
      'url.error.max'
    ),

  required: requiredStr('url.error.required')
    .max(WebsiteConstraint.MAX_LENGTH, 'url.error.max')
    .refine(isHttpsUrl, 'url.error.format')
}

export const svg = requiredStr('svg.error.required').max(
  SvgConstraint.MAX_LENGTH,
  'svg.error.max'
)

export const displayName = requiredStr('name.error.required')
  .min(NameConstraint.MIN_LENGTH, 'name.error.min')
  .max(NameConstraint.MAX_LENGTH, 'name.error.max')

export const description = optionalStr().refine(
  value =>
    value === undefined || value.length <= DescriptionConstraint.MAX_LENGTH,
  'description.error.max'
)

export const position = optionalStr().refine(
  value => !value || value.length <= PositionConstraint.MAX_LENGTH,
  'position.error.max'
)

export const status = requiredStr('status.error.required').refine(
  value => allUserStatuses.includes(value),
  'status.error.invalid'
)

export const permissions = z
  .record(z.string(), z.record(z.string(), z.boolean()))
  .optional()
