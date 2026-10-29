import { isUser } from '@ui/lib/types'

// Admins are not team members, and the protected creator cannot leave.
// An unknown creator means team details are still loading
export const canLeaveTeam = (me, creator) =>
  isUser(me?.role) && !!creator && creator.id !== me.id
