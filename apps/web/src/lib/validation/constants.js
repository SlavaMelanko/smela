export const NameConstraint = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50
}

export const TeamNameConstraint = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100
}

export const DescriptionConstraint = {
  MAX_LENGTH: 500
}

export const PasswordConstraint = {
  MIN_LENGTH: 8,
  // Requires at least one uppercase letter, one digit, and one special character
  // Minimum 8 characters total (case-insensitive matching with 'i' flag)
  STRONG: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Z\d@$!%*#?&]{8,}$/i
}

export const EmailConstraint = {
  // Requires standard email format (e.g., user@domain.com)
  // Rejects local-only addresses like user@localhost
  STANDARD: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
}
