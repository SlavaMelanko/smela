import { db, teamRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'

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

// A user belongs to at most one team
export const createTeam = async (userId: string, input: CreateTeamInput) => {
  const existingTeam = await teamRepo.findUserTeam(userId)

  if (existingTeam) {
    throw new AppError(ErrorCode.Conflict, 'User already belongs to a team')
  }

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
