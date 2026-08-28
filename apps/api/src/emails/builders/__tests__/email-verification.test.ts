import { describe, expect, it } from 'bun:test'

import type { CompanyProfile } from '../../company'
import type { EmailSenderProfile } from '../../sender-profile'

import { EmailSenderType } from '../../sender-profile'
import { VerificationEmailMessageBuilder } from '../email-verification'
import {
  buildSenderProfileResolver,
  buildSocialLinksResolver
} from './resolvers'

const company: CompanyProfile = { name: 'SMELA' }

const senderProfile: EmailSenderProfile = {
  email: 'noreply@smela.me',
  name: 'SMELA'
}

describe('VerificationEmailMessageBuilder', () => {
  it('resolves the System sender profile', async () => {
    const senderProfileResolver = buildSenderProfileResolver(senderProfile)

    const builder = new VerificationEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      verificationUrl: 'https://example.com/verify-email?token=abc123'
    })

    await builder.build(
      senderProfileResolver,
      buildSocialLinksResolver(),
      company
    )

    expect(senderProfileResolver.get).toHaveBeenCalledWith(
      EmailSenderType.System
    )
  })

  it('builds an email message addressed to the given recipient with the resolved sender', async () => {
    const builder = new VerificationEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      verificationUrl: 'https://example.com/verify-email?token=abc123'
    })

    const message = await builder.build(
      buildSenderProfileResolver(senderProfile),
      buildSocialLinksResolver(),
      company
    )

    expect(message.to).toBe('user@example.com')
    expect(message.from).toEqual(senderProfile)
    expect(message.subject.length).toBeGreaterThan(0)
    expect(message.html.length).toBeGreaterThan(0)
    expect(message.text.length).toBeGreaterThan(0)
  })
})
