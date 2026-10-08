import { z } from 'zod'

import { isStagingOrProd } from './core'

export const networkEnvVars = (nodeEnv?: string) => {
  const jwtSecretSchema = z.string().min(10)

  return {
    // JWT configuration
    JWT_SECRET: jwtSecretSchema,
    JWT_SECRET_PREVIOUS: jwtSecretSchema.optional(),
    JWT_EXPIRATION: z.coerce.number().int().positive().default(900),
    JWT_SIGNATURE_ALGORITHM: z.enum(['HS256', 'HS512']).default('HS256'),

    // Refresh token cookie configuration
    COOKIE_REFRESH_TOKEN_NAME: z.string().default('refresh-token'),
    COOKIE_REFRESH_TOKEN_EXPIRATION: z.coerce
      .number()
      .int()
      .positive()
      .default(86400), // 24 hours
    COOKIE_REFRESH_TOKEN_DOMAIN: z.string().optional(), // domain for cookies in production/staging

    // CORS: Required for staging/production, optional for dev/test
    ALLOWED_ORIGINS: isStagingOrProd(nodeEnv)
      ? z
          .string()
          .trim()
          .min(
            1,
            'ALLOWED_ORIGINS is required for staging/production environments'
          )
      : z.string().optional(),

    // Base URLs
    BE_BASE_URL: z.url().default('http://localhost:3000'),
    FE_USER_URL: z.url().default('http://localhost:5173'),
    FE_ADMIN_URL: z.url().default('http://localhost:5175')
  }
}
