import type { TeamMemberDetails, TeamWithMemberCount } from '@/data'
import type { UserClaims } from '@/security/jwt'

export interface Variables {
  user: UserClaims
  team: TeamWithMemberCount | undefined
  currentUser: TeamMemberDetails | undefined
  targetMember: TeamMemberDetails | undefined
}

export interface AppContext {
  Variables: Variables
}
