import { afterEach, describe, expect, it } from 'bun:test'

import { ModuleMocker } from '@/__tests__'

import { createConsoleTransport } from '../console'

describe('createConsoleTransport', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const mockEnv = async (isDevOrTest: boolean) =>
    moduleMocker.mock('@/env', () => ({
      default: { LOG_LEVEL: 'warn' },
      isDevOrTestEnv: () => isDevOrTest
    }))

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it.each([
    {
      name: 'pretty-prints in dev or test',
      isDevOrTest: true,
      target: 'pino-pretty',
      colorize: true
    },
    {
      name: 'writes JSON in staging or production',
      isDevOrTest: false,
      target: 'pino/file',
      colorize: undefined
    }
  ])('$name', async ({ isDevOrTest, target, colorize }) => {
    await mockEnv(isDevOrTest)

    expect(createConsoleTransport()).toEqual({
      target,
      level: 'warn',
      options: { destination: 1, colorize }
    })
  })
})
