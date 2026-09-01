import type { EmailMessage } from '../../providers'

import type { UserPreferences } from '../../user-preferences'
import { describe, expect, it } from 'bun:test'

import { EmailMessageBuilder } from '../builder'

class TestEmailMessageBuilder extends EmailMessageBuilder<{
  firstName: string
}> {
  async build(): Promise<EmailMessage> {
    return {
      to: this.to,
      from: { email: 'noreply@smela.me', name: 'SMELA' },
      subject: 'Test',
      html: '',
      text: ''
    }
  }

  getResolvedPreferences(): UserPreferences {
    return this.getPreferences()
  }
}

describe('EmailMessageBuilder', () => {
  it('falls back to English/light theme when no preferences are given', () => {
    const builder = new TestEmailMessageBuilder('user@example.com', {
      firstName: 'John'
    })

    expect(builder.getResolvedPreferences()).toEqual({
      locale: 'en',
      theme: 'light'
    })
  })

  it('merges partial preferences over the defaults', () => {
    const builder = new TestEmailMessageBuilder(
      'user@example.com',
      { firstName: 'John' },
      { theme: 'dark' } as UserPreferences
    )

    expect(builder.getResolvedPreferences()).toEqual({
      locale: 'en',
      theme: 'dark'
    })
  })

  it('keeps fully specified preferences as-is', () => {
    const preferences: UserPreferences = { locale: 'uk', theme: 'dark' }
    const builder = new TestEmailMessageBuilder(
      'user@example.com',
      { firstName: 'John' },
      preferences
    )

    expect(builder.getResolvedPreferences()).toEqual(preferences)
  })
})
