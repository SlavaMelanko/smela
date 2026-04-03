import { init as sentryInit } from '@sentry/react'

import env from '@/lib/env'

export const init = ({ name, version }) => {
  if (!env.SENTRY_DSN) {
    return
  }

  sentryInit({
    dsn: env.SENTRY_DSN,
    environment: env.MODE,
    release: `${name}@${version}`
  })
}
