export enum TokenType {
  EmailVerification = 'email_verification',
  PasswordReset = 'password_reset',
  RefreshToken = 'refresh_token',
  UserInvite = 'user_invite'
}

export enum InviteKind {
  Admin = 'admin',
  Member = 'member'
}

export interface InviteMetadata {
  kind: InviteKind
}

export enum TokenStatus {
  Pending = 'pending',
  Used = 'used',
  Deprecated = 'deprecated',
  Cancelled = 'cancelled'
}
