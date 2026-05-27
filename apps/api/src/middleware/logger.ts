import { pinoLogger } from 'hono-pino'

import { logger } from '@/logging'

export const requestLogger = pinoLogger({
  pino: logger
})
