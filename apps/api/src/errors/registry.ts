import HttpStatus from '@/net/http/status'

import { ErrorCode } from './codes'

export const ErrorRegistry: Record<
  ErrorCode,
  { message: string; status: HttpStatus }
> = {
  // Auth errors
  [ErrorCode.EmailAlreadyInUse]: {
    message: 'Email is already in use.',
    status: HttpStatus.CONFLICT
  },
  [ErrorCode.Forbidden]: {
    message: 'Forbidden.',
    status: HttpStatus.FORBIDDEN
  },
  [ErrorCode.InvalidCredentials]: {
    message: 'Invalid email or password.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.InvalidPassword]: {
    message: 'Current password is incorrect.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.SocialAuthOnly]: {
    message:
      'This account uses social login. Please sign in with your social provider.',
    status: HttpStatus.CONFLICT
  },
  [ErrorCode.Unauthorized]: {
    message: 'Unauthorized access.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.GoogleEmailNotVerified]: {
    message: 'Google email is not verified.',
    status: HttpStatus.FORBIDDEN
  },
  [ErrorCode.GoogleOAuthCancelled]: {
    message: 'Google sign-in was cancelled.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.GoogleOAuthFailed]: {
    message: 'Google sign-in failed.',
    status: HttpStatus.BAD_GATEWAY
  },
  [ErrorCode.GoogleOAuthInvalidState]: {
    message: 'Invalid Google sign-in state.',
    status: HttpStatus.BAD_REQUEST
  },

  // Token errors
  [ErrorCode.TokenAlreadyUsed]: {
    message: 'Token has already been used.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.TokenCancelled]: {
    message: 'Token has been cancelled.',
    status: HttpStatus.GONE
  },
  [ErrorCode.TokenDeprecated]: {
    message: 'Token has been deprecated.',
    status: HttpStatus.GONE
  },
  [ErrorCode.TokenExpired]: {
    message: 'Token has expired.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.TokenNotFound]: {
    message: 'Token not found.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.TokenTypeMismatch]: {
    message: 'Token type mismatch.',
    status: HttpStatus.BAD_REQUEST
  },

  // Refresh token errors
  [ErrorCode.InvalidRefreshToken]: {
    message: 'Invalid refresh token.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.RefreshTokenExpired]: {
    message: 'Refresh token has expired.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.RefreshTokenRevoked]: {
    message: 'Refresh token has been revoked.',
    status: HttpStatus.UNAUTHORIZED
  },
  [ErrorCode.MissingRefreshToken]: {
    message: 'Refresh token is missing.',
    status: HttpStatus.BAD_REQUEST
  },

  // Captcha errors
  [ErrorCode.CaptchaInvalidToken]: {
    message: 'Invalid reCAPTCHA token.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.CaptchaValidationFailed]: {
    message: 'reCAPTCHA token validation failed.',
    status: HttpStatus.BAD_REQUEST
  },

  // Resource errors
  [ErrorCode.Conflict]: {
    message: 'Resource already exists.',
    status: HttpStatus.CONFLICT
  },
  [ErrorCode.NotFound]: {
    message: 'Resource not found.',
    status: HttpStatus.NOT_FOUND
  },

  // System errors
  [ErrorCode.InternalError]: {
    message: 'Internal server error.',
    status: HttpStatus.INTERNAL_SERVER_ERROR
  },
  [ErrorCode.ValidationError]: {
    message: 'Validation error.',
    status: HttpStatus.BAD_REQUEST
  },

  // Request errors
  [ErrorCode.RequestTooLarge]: {
    message: 'Request body too large.',
    status: HttpStatus.REQUEST_TOO_LONG
  },
  [ErrorCode.InvalidContentLength]: {
    message: 'Invalid Content-Length header.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.ContentLengthMismatch]: {
    message: 'Content-Length header does not match actual body size.',
    status: HttpStatus.BAD_REQUEST
  },
  [ErrorCode.BadRequest]: {
    message: 'Bad request.',
    status: HttpStatus.BAD_REQUEST
  }
}
