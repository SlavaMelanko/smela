import { z } from 'zod'

import { companyEnvVars } from './company'
import { coreEnvVars } from './core'
import { createDbUrl, dbEnvVars } from './db'
import { emailEnvVars } from './email'
import { networkEnvVars } from './network'
import { captchaEnvVars, googleOAuthEnvVars, sentryEnvVars } from './services'

// eslint-disable-next-line node/no-process-env
export const validateEnvVars = (envVars: NodeJS.ProcessEnv = process.env) => {
  const nodeEnv = envVars.NODE_ENV

  const envSchema = z.object({
    ...coreEnvVars,
    ...dbEnvVars,
    ...emailEnvVars(nodeEnv),
    ...networkEnvVars(nodeEnv),
    ...companyEnvVars,
    ...captchaEnvVars,
    ...sentryEnvVars,
    ...googleOAuthEnvVars
  })

  const result = envSchema.safeParse(envVars)

  if (result.success) {
    return { ...result.data, POSTGRES_URL: createDbUrl(result.data) }
  }

  console.error(
    'Failed to parse environment variables:',
    z.flattenError(result.error).fieldErrors
  )

  process.exit(1)
}

export const env = validateEnvVars()
