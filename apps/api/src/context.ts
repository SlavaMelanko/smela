import type { TeamMemberDetails, TeamWithMemberCount } from '@/data'
import type { UserClaims } from '@/security/jwt'

export interface Variables {
  user: UserClaims
  team: TeamWithMemberCount | undefined
  currentUser: TeamMemberDetails | undefined
  targetMember: TeamMemberDetails | undefined
  teamPermissions: string[] | undefined
}

export interface AppContext {
  Variables: Variables
}
