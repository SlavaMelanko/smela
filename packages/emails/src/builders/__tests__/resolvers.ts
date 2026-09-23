import type {
  EmailSenderProfile,
  EmailSenderProfileResolver
} from '../../sender-profile'

import type { SocialLinksResolver } from '../../social-links'
import { mock } from 'bun:test'

export const buildSenderProfileResolver = (
  senderProfile: EmailSenderProfile
): EmailSenderProfileResolver => ({
  get: mock(async () => senderProfile),
  invalidate: mock(() => {})
})

export const buildSocialLinksResolver = (): SocialLinksResolver => ({
  list: mock(async () => []),
  invalidate: mock(() => {})
})
