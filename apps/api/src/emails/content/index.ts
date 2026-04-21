import type { SupportedLocale } from '@/types'

import * as en from './en'
import * as uk from './uk'

export type { default as EmailVerificationContent } from './email-verification'
export type { default as PasswordResetEmailContent } from './password-reset'
export type { default as UserInvitationContent } from './user-invitation'

export type LocaleContent = typeof en

const content: Record<SupportedLocale, LocaleContent> = {
  en,
  uk
}

export const getContent = (locale: SupportedLocale = 'en'): LocaleContent => {
  if (locale in content) {
    return content[locale]
  }

  return content.en
}

export default getContent
