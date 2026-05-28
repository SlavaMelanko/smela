import { teamRepo } from '@/data'

export interface UpdateTeamInput {
  name?: string
  website?: string
  description?: string | null
}

export const updateTeam = async (teamId: string, updates: UpdateTeamInput) => {
  const team = await teamRepo.update(teamId, updates)

  return { team }
}
