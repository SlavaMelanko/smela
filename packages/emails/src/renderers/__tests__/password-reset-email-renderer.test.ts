import type { CompanyProfile } from '../../company'

import type { PasswordResetEmailData } from '../password-reset'
import { describe, expect, it } from 'bun:test'

import PasswordResetEmailRenderer from '../password-reset'
import { testRendererContract } from './renderer-contract'

const renderer = new PasswordResetEmailRenderer()

const RESET_URL = 'https://example.com/reset-password?token=xyz789'

testRendererContract<PasswordResetEmailData>({
  name: 'Password reset',
  renderer,
  data: { firstName: 'John', resetUrl: RESET_URL },
  url: RESET_URL,
  otherData: {
    firstName: 'Alice',
    resetUrl: 'https://example.com/reset-password?token=other'
  },
  englishSubject: /password|reset|recovery|forgot/,
  ukrainianSubject: /скинути|пароль/
})

describe('PasswordResetEmailRenderer', () => {
  const company: CompanyProfile = { name: 'SMELA' }

  it('keeps long reset urls intact', async () => {
    const resetUrl =
      'https://example.com/reset-password?token=very-long-reset-token-that-might-be-used-in-production-environments-with-secure-random-generation-xyz789abc123'

    const result = await renderer.render(
      { firstName: 'John', resetUrl },
      { company }
    )

    expect(result.html).toContain(resetUrl)
    expect(result.text).toContain(resetUrl)
  })
})
