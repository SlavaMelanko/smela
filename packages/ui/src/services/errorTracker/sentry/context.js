import { setUser as sentrySetUser } from '@sentry/react'

export const setUser = user => {
  sentrySetUser({ id: user.id })
}

export const clearUser = () => {
  sentrySetUser(null)
}
