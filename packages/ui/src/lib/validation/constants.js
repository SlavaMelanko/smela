// Shared bounds for user-facing names and entity labels
export const NameConstraint = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50
}

export const DescriptionConstraint = {
  MAX_LENGTH: 500
}

// Keep in sync with apps/api/src/security/password/index.ts (PASSWORD_REGEX)
export const PasswordConstraint = {
  MIN_LENGTH: 8,
  // Requires at least one uppercase letter, one digit, and one special character
  // Minimum 8 characters total (case-insensitive matching with 'i' flag)
  STRONG: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Z\d@$!%*#?&]{8,}$/i
}

// Keep in sync with zod's z.email() regex (apps/api uses z.email() directly)
export const EmailConstraint = {
  STANDARD:
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+.-]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/
}
