import type { CompanyProfile } from '../../company'

import type { EmailSenderProfile } from '../../sender-profile'
import { describe, expect, it } from 'bun:test'

import { EmailSenderType } from '../../sender-profile'
import { PasswordResetEmailMessageBuilder } from '../password-reset'
import {
  buildSenderProfileResolver,
  buildSocialLinksResolver
} from './resolvers'

const company: CompanyProfile = { name: 'SMELA' }

const senderProfile: EmailSenderProfile = {
  email: 'security@smela.me',
  name: 'SMELA Security'
}

describe('PasswordResetEmailMessageBuilder', () => {
  it('resolves the Security sender profile', async () => {
    const senderProfileResolver = buildSenderProfileResolver(senderProfile)

    const builder = new PasswordResetEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      resetUrl: 'https://example.com/reset-password?token=xyz789'
    })

    await builder.build(
      senderProfileResolver,
      buildSocialLinksResolver(),
      company
    )

    expect(senderProfileResolver.get).toHaveBeenCalledWith(
      EmailSenderType.Security
    )
  })

  it('builds an email message addressed to the given recipient with the resolved sender', async () => {
    const builder = new PasswordResetEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      resetUrl: 'https://example.com/reset-password?token=xyz789'
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
