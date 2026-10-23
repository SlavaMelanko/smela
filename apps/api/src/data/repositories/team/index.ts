import {
  activateMembership,
  createMembership,
  createTeam,
  deleteMembership,
  deletePendingMembership,
  markMembershipLastActive,
  setMembershipPermissions,
  updateMembership,
  updateTeam
} from './mutations'
import {
  findMembershipPermissions,
  findTeam,
  findTeamById,
  findTeamMember,
  findTeamMembers,
  findUserInvites,
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
  findUserInvites,
  findUserTeams,
  search: searchTeams
}

const membershipMutations = {
  activateMembership,
  createMembership,
  deleteMembership,
  deletePendingMembership,
  markMembershipLastActive,
  setMembershipPermissions,
  updateMembership
}

const membershipQueries = {
  findMembershipPermissions
}

const memberQueries = {
  findMember: findTeamMember,
  findMembers: findTeamMembers
}

export const teamRepo = {
  ...teamMutations,
  ...teamQueries,
  ...membershipMutations,
  ...membershipQueries,
  ...memberQueries
}
