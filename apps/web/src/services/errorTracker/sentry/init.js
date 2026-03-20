import { init as sentryInit } from '@sentry/react'

import env from '@/lib/env'

import packageJson from '../../../../package.json'

export const init = () => {
  if (!env.SENTRY_DSN) {
    return
  }

  sentryInit({
    dsn: env.SENTRY_DSN,
    environment: env.MODE,
    release: `${packageJson.name}@${packageJson.version}`
  })
}
