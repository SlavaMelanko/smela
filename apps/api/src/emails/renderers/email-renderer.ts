import type { UserPreferences } from '@/types'

import type { Metadata } from '../metadata'
import type { SocialLink } from '../social-links'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export interface EmailRenderer<T = any> {
  render: (
    data: T,
    userPreferences?: UserPreferences,
    metadata?: Metadata,
    socialLinks?: SocialLink[]
  ) => Promise<RenderedEmail>
}
