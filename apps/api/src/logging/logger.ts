import type { DestinationStream } from 'pino'

import pino from 'pino'

import env, { isTestEnv } from '@/env'

import { getTransports } from './transports'

// Worker-backed transports spawn a thread per global, which breaks under `bun test --isolate`.
// Tests log straight to stdout instead
const createDestination = (): DestinationStream =>
  isTestEnv()
    ? pino.destination({ dest: 1, sync: true })
    : pino.transport({ targets: getTransports() })

const logger = pino(
  {
    level: env.LOG_LEVEL
  },
  createDestination()
)

export default logger
