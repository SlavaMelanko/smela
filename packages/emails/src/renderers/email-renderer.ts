import type { CompanyProfile } from '../company'
import type { SocialLink } from '../social-links'
import type { UserPreferences } from '../user-preferences'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export interface RenderContext {
  company: CompanyProfile
  preferences?: UserPreferences
  socialLinks?: SocialLink[]
}

export interface EmailRenderer<T = any> {
  render: (data: T, context: RenderContext) => Promise<RenderedEmail>
}
