import {
  activateTeamMember,
  createTeam,
  createTeamMember,
  deleteTeamMember,
  markTeamMemberLastActive,
  setTeamMemberPermissions,
  updateTeam,
  updateTeamMember
} from './mutations'
import {
  findTeam,
  findTeamById,
  findTeamMember,
  findTeamMemberPermissions,
  findTeamMembers,
  findUserTeams,
  searchTeams
} from './queries'

export * from './types'

const teamMutations = {
  create: createTeam,
  update: updateTeam
}

const teamQueries = {
  find: findTeam,
  findById: findTeamById,
  findUserTeams,
  search: searchTeams
}

const memberMutations = {
  activateMember: activateTeamMember,
  createMember: createTeamMember,
  deleteMember: deleteTeamMember,
  markMemberLastActive: markTeamMemberLastActive,
  setMemberPermissions: setTeamMemberPermissions,
  updateMember: updateTeamMember
}

const memberQueries = {
  findMember: findTeamMember,
  findMemberPermissions: findTeamMemberPermissions,
  findMembers: findTeamMembers
}

export const teamRepo = {
  ...teamMutations,
  ...teamQueries,
  ...memberMutations,
  ...memberQueries
}
