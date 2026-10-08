import { z } from 'zod'

import { isStagingOrProd } from './core'

export const emailEnvVars = (nodeEnv?: string) => ({
  EMAIL_RESEND_API_KEY: isStagingOrProd(nodeEnv)
    ? z
        .string()
        .min(
          1,
          'EMAIL_RESEND_API_KEY is required in production/staging environments'
        )
    : z.string().optional(),

  // Ethereal email configuration (for development)
  EMAIL_ETHEREAL_HOST: z.string().optional(),
  EMAIL_ETHEREAL_PORT: z.coerce.number().optional(),
  EMAIL_ETHEREAL_USERNAME: z.string().optional(),
  EMAIL_ETHEREAL_PASSWORD: z.string().optional()
})
