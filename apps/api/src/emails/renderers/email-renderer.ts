import type { SocialLink } from '../social-links'
import type { UserPreferences } from '../user-preferences'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export interface EmailRenderer<T = any> {
  render: (
    data: T,
    userPreferences?: UserPreferences,
    socialLinks?: SocialLink[]
  ) => Promise<RenderedEmail>
}
