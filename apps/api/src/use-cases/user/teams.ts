import { db, teamRepo } from '@/data'

export interface CreateTeamInput {
  name: string
  website: string
  description?: string
}

export interface UpdateTeamInput {
  name?: string
  website?: string
  description?: string | null
}

export const createTeam = async (userId: string, input: CreateTeamInput) => {
  const team = await db.transaction(async tx => {
    const newTeam = await teamRepo.create(input, tx)

    await teamRepo.createMember({ userId, teamId: newTeam.id }, tx)

    return newTeam
  })

  return { team }
}

export const updateTeam = async (teamId: string, updates: UpdateTeamInput) => {
  const team = await teamRepo.update(teamId, updates)

  return { team }
}
