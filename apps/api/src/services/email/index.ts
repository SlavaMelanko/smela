export { emailService } from './email-service'

export {
  buildAppUrl,
  buildInviteUrl,
  buildResetPasswordUrl,
  buildVerificationUrl
} from './email-urls'

export type { SupportedLocale, Theme, UserPreferences } from '@smela/emails'

export {
  EmailSenderType,
  PasswordResetEmailMessageBuilder,
  UserInviteEmailMessageBuilder,
  VerificationEmailMessageBuilder
} from '@smela/emails'
