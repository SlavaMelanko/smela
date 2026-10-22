import { InviteKind } from '@smela/contracts'

export enum TokenType {
  EmailVerification = 'email_verification',
  PasswordReset = 'password_reset',
  RefreshToken = 'refresh_token',
  UserInvite = 'user_invite'
}

export { InviteKind }

export type InviteMetadata =
  { kind: InviteKind.Admin } | { kind: InviteKind.Member; teamId: string }

export enum TokenStatus {
  Pending = 'pending',
  Used = 'used',
  Deprecated = 'deprecated',
  Cancelled = 'cancelled'
}
