import * as noop from './noop'
import * as sentry from './sentry'

// Literal env access lets the bundler drop the Sentry SDK when DSN is not set
const tracker = import.meta.env.VITE_SENTRY_DSN ? sentry : noop

export const {
  init: initErrorTracker,
  captureError,
  captureMessage,
  setUser,
  clearUser
} = tracker
