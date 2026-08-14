// Shared bounds for user-facing names and entity labels
export const NameConstraint = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50
}

// Job title / team position — no minimum, matching api's actual rule
export const PositionConstraint = {
  MAX_LENGTH: 100
}

export const WebsiteConstraint = {
  MAX_LENGTH: 255
}

// Free-text descriptions across entities (team, email sender profile, etc.)
export const DescriptionConstraint = {
  MAX_LENGTH: 500
}

export const PasswordConstraint = {
  MIN_LENGTH: 8,
  // bcrypt truncates at 72 bytes; capped below that so no two distinct
  // passwords are ever accepted and hashed identically
  MAX_LENGTH: 64,
  // Requires at least one uppercase letter, one digit, and one special character
  // Length is owned by MIN_LENGTH/MAX_LENGTH, not baked into this regex
  STRONG: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Z\d@$!%*#?&]+$/i
}

export const EmailConstraint = {
  // RFC 5321 max mailbox length
  MAX_LENGTH: 254,
  STANDARD:
    /^(?!.*\.\.)[\w'+-](?:[\w'+.-]*[\w+-])?@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i
}
