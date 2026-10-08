import type { DestinationStream } from 'pino'

import pino from 'pino'
import pretty from 'pino-pretty'

import { env, isTestEnv } from '@/env'

import { getTransports } from './transports'

const createDestination = (): DestinationStream => {
  if (isTestEnv()) {
    // Tests pretty-print in-process. Transports run in a worker thread,
    // which breaks `bun test --isolate`
    return pretty({ destination: 1, sync: true, colorize: true })
  }

  return pino.transport({ targets: getTransports() })
}

const logger = pino(
  {
    level: env.LOG_LEVEL
  },
  createDestination()
)

export default logger
