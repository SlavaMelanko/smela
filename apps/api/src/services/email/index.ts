export { EmailService, emailService } from './email-service'

export {
  buildInviteUrl,
  buildResetPasswordUrl,
  buildVerificationUrl
} from './email-urls'

export type { UserPreferences } from '@/emails'

export {
  EmailSenderType,
  PasswordResetEmailMessageBuilder,
  UserInviteEmailMessageBuilder,
  VerificationEmailMessageBuilder
} from '@/emails'
