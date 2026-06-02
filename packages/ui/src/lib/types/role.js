export const Role = {
  User: 'user',
  Admin: 'admin',
  Owner: 'owner'
}

export const isUser = role => role === Role.User

export const isAdmin = role => role === Role.Admin || role === Role.Owner

export const isOwner = role => role === Role.Owner
