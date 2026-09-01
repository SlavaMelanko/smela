// Server-side request validation (the enforced boundary).
// Client-side counterpart: packages/ui/src/lib/validation/rules.js
import {
  DescriptionConstraint,
  EmailConstraint,
  NameConstraint,
  PasswordConstraint,
  PositionConstraint,
  WebsiteConstraint
} from '@smela/contracts'
import { z } from 'zod'

import type { SupportedLocale, Theme } from '@/services/email'

import { TOKEN_LENGTH } from '@/security/token'
import { EmailSenderType } from '@/services/email'
import { Resource, Role, UserStatus } from '@/types'

const normalizeEmail = (email: string): string => email.trim().toLowerCase()

const email = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.string().max(EmailConstraint.MAX_LENGTH))
  .refine(value => EmailConstraint.STANDARD.test(value), {
    message: 'Invalid email'
  })

const displayName = z
  .string()
  .trim()
  .min(NameConstraint.MIN_LENGTH)
  .max(NameConstraint.MAX_LENGTH)

const description = z.string().trim().max(DescriptionConstraint.MAX_LENGTH)

export const rules = {
  user: {
    id: z.uuid(),

    email,

    password: z
      .string()
      .min(PasswordConstraint.MIN_LENGTH)
      .max(PasswordConstraint.MAX_LENGTH)
      .regex(PasswordConstraint.STRONG, {
        message:
          'Minimum eight characters, at least one letter, one number and one special character'
      }),

    // Required for signup, add .optional() for updates
    firstName: z
      .string()
      .trim()
      .min(NameConstraint.MIN_LENGTH)
      .max(NameConstraint.MAX_LENGTH),

    // Normalizes null/'' → "", valid string → trimmed
    // undefined means "don't touch the field"
    lastName: z.preprocess(
      val => (val === null || val === '' ? '' : val),
      z.union([
        z.literal(''),
        z
          .string()
          .trim()
          .min(NameConstraint.MIN_LENGTH)
          .max(NameConstraint.MAX_LENGTH)
      ])
    ),

    role: z.enum(Role),
    status: z.enum(UserStatus)
  },

  token: {
    oneTime: z
      .string()
      .length(
        TOKEN_LENGTH,
        `Token must be exactly ${TOKEN_LENGTH} characters long`
      )
  },

  captcha: {
    token: z
      .string()
      .min(1, 'reCAPTCHA token is required')
      .min(20, 'reCAPTCHA token is too short')
      .max(2000, 'reCAPTCHA token is too long')
      .regex(/^[\w-]+$/, 'reCAPTCHA token contains invalid characters')
  },

  pagination: {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25)
  },

  preferences: {
    locale: z.enum(['en', 'uk'] satisfies SupportedLocale[]).default('en'),
    theme: z.enum(['light', 'dark'] satisfies Theme[]).default('light')
  },

  team: {
    id: z.uuid(),
    name: displayName,
    website: z.url().max(WebsiteConstraint.MAX_LENGTH),
    description,
    position: z.string().trim().max(PositionConstraint.MAX_LENGTH),
    search: z.string().trim().max(100)
  },

  emailSenderProfile: {
    profile: z.enum(EmailSenderType),
    email,
    name: displayName,
    description
  },

  socialLink: {
    network: z.string().trim().min(1).max(32)
  },

  userFilter: {
    search: z.string().trim(),

    statuses: z
      .string()
      .transform(val => val.split(','))
      .pipe(z.array(z.enum(UserStatus))),

    roles: z
      .string()
      .transform(val => val.split(','))
      .pipe(z.array(z.enum(Role)))
  },

  permissions: (() => {
    const resourcePermissions = z
      .object({
        view: z
          .boolean()
          .nullish()
          .transform(v => v ?? false),
        manage: z
          .boolean()
          .nullish()
          .transform(v => v ?? false)
      })
      .optional()

    type ResourcePermissions = typeof resourcePermissions

    return z
      .object(
        Object.fromEntries(
          Object.values(Resource).map(r => [r, resourcePermissions])
        ) as Record<Resource, ResourcePermissions>
      )
      .refine(data => Object.values(data).some(v => v !== undefined), {
        message: 'At least one resource must be specified'
      })
  })()
}
