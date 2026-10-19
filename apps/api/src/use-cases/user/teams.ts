import { db, teamRepo } from '@/data'
import { getMemberFullPermissions } from '@/types'

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
    const newTeam = await teamRepo.create({ ...input, createdBy: userId }, tx)

    const membership = await teamRepo.createMember(
      { userId, teamId: newTeam.id },
      tx
    )

    await teamRepo.setMemberPermissions(
      membership.id,
      getMemberFullPermissions(),
      tx
    )

    return newTeam
  })

  return { team }
}

export const updateTeam = async (teamId: string, updates: UpdateTeamInput) => {
  const team = await teamRepo.update(teamId, updates)

  return { team }
}
