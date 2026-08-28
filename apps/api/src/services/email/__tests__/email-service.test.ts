import { describe, expect, it, mock } from 'bun:test'

import type {
  CompanyProfile,
  EmailMessage,
  EmailMessageBuilder,
  EmailProvider,
  EmailSenderProfileResolver,
  SocialLinksResolver
} from '@/emails'

import { EmailService } from '../email-service'

const message: EmailMessage = {
  to: 'user@example.com',
  from: { email: 'noreply@smela.me', name: 'SMELA' },
  subject: 'Test',
  html: '<p>Test</p>',
  text: 'Test'
}

const senderProfileResolver: EmailSenderProfileResolver = {
  get: mock(async () => message.from),
  invalidate: mock(() => {})
}

const socialLinksResolver: SocialLinksResolver = {
  list: mock(async () => []),
  invalidate: mock(() => {})
}

const buildProvider = (
  send: EmailProvider['send'] = mock(async () => ({
    provider: 'ethereal' as const,
    messageId: 'test-id'
  }))
): EmailProvider => ({ send })

const company: CompanyProfile = { name: 'SMELA' }

const buildBuilder = (
  build = mock(async () => message)
): EmailMessageBuilder<unknown> =>
  ({ build }) as unknown as EmailMessageBuilder<unknown>

describe('EmailService', () => {
  it('builds the message and hands it to the provider', async () => {
    const provider = buildProvider()
    const service = new EmailService(
      provider,
      senderProfileResolver,
      socialLinksResolver,
      company
    )

    await service.send(buildBuilder())

    expect(provider.send).toHaveBeenCalledWith(message)
  })

  it('passes both resolvers and the company profile to the builder', async () => {
    const build = mock(async () => message)
    const service = new EmailService(
      buildProvider(),
      senderProfileResolver,
      socialLinksResolver,
      company
    )

    await service.send(buildBuilder(build))

    expect(build).toHaveBeenCalledWith(
      senderProfileResolver,
      socialLinksResolver,
      company
    )
  })

  it('does not reject when the provider fails', async () => {
    const provider = buildProvider(
      mock(async () => {
        throw new Error('Provider unavailable')
      })
    )
    const service = new EmailService(
      provider,
      senderProfileResolver,
      socialLinksResolver,
      company
    )

    expect(service.send(buildBuilder())).resolves.toBeUndefined()
  })

  it('does not reject when building the message fails', async () => {
    const build = mock(async () => {
      throw new Error('Render failed')
    })
    const service = new EmailService(
      buildProvider(),
      senderProfileResolver,
      socialLinksResolver,
      company
    )

    expect(service.send(buildBuilder(build))).resolves.toBeUndefined()
  })
})
