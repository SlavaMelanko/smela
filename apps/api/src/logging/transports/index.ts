import type { TransportTargetOptions } from 'pino'

import { createConsoleTransport } from './console'

export const getTransports = (): TransportTargetOptions[] => [
  createConsoleTransport()
]
