import type { socialLinksTable } from '../../schema'

export type SocialLinkRecord = typeof socialLinksTable.$inferSelect

export type CreateSocialLinkInput = typeof socialLinksTable.$inferInsert

export type UpdateSocialLinkInput = Partial<
  Omit<CreateSocialLinkInput, 'id' | 'createdAt'>
>

export type SocialLink = SocialLinkRecord
