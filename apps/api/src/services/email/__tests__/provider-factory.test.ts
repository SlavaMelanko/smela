import { EtherealEmailProvider, ResendEmailProvider } from '@smela/emails'
import { afterEach, describe, expect, it } from 'bun:test'

import { ModuleMocker } from '@/__tests__'

import { createEmailProvider } from '../provider-factory'

describe('createEmailProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const ethereal = {
    EMAIL_ETHEREAL_HOST: 'smtp.ethereal.email',
    EMAIL_ETHEREAL_PORT: 587,
    EMAIL_ETHEREAL_USERNAME: 'user',
    EMAIL_ETHEREAL_PASSWORD: 'pass'
  }

  const mockEnv = async (resendApiKey?: string) =>
    moduleMocker.mock('@/env', () => ({
      env: { ...ethereal, EMAIL_RESEND_API_KEY: resendApiKey }
    }))

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('uses the explicit type over the configured API key', async () => {
    await mockEnv('re_test_key')

    expect(createEmailProvider('ethereal')).toBeInstanceOf(
      EtherealEmailProvider
    )
  })

  it('defaults to resend when the API key is configured', async () => {
    await mockEnv('re_test_key')

    expect(createEmailProvider()).toBeInstanceOf(ResendEmailProvider)
  })

  it('defaults to ethereal when the API key is missing', async () => {
    await mockEnv()

    expect(createEmailProvider()).toBeInstanceOf(EtherealEmailProvider)
  })
})
