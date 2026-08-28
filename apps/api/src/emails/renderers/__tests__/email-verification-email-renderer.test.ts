import { describe, expect, it } from 'bun:test'

import type { CompanyProfile } from '../../company'
import type { EmailVerificationEmailData } from '../email-verification'

import EmailVerificationEmailRenderer from '../email-verification'
import { testRendererContract } from './renderer-contract'

const renderer = new EmailVerificationEmailRenderer()

const VERIFICATION_URL = 'https://example.com/verify?token=abc123'

testRendererContract<EmailVerificationEmailData>({
  name: 'Email verification',
  renderer,
  data: { firstName: 'John', verificationUrl: VERIFICATION_URL },
  url: VERIFICATION_URL,
  otherData: {
    firstName: 'Alice',
    verificationUrl: 'https://example.com/verify?token=other'
  },
  englishSubject: /verify|email|account/,
  ukrainianSubject: /підтвердіть|електронну/
})

describe('EmailVerificationEmailRenderer', () => {
  const company: CompanyProfile = { name: 'SMELA' }

  it('keeps long verification urls intact', async () => {
    const verificationUrl =
      'https://example.com/verify?token=very-long-token-that-might-be-used-in-production-environments-with-secure-random-generation-abc123def456'

    const result = await renderer.render(
      { firstName: 'John', verificationUrl },
      { company }
    )

    expect(result.html).toContain(verificationUrl)
    expect(result.text).toContain(verificationUrl)
  })
})
