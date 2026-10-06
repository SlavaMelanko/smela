import { init as sentryInit } from '@sentry/react'
import env from '@ui/lib/env'

export const init = ({ name, version }) => {
  sentryInit({
    dsn: env.SENTRY_DSN,
    environment: env.MODE,
    release: `${name}@${version}`
  })
}
