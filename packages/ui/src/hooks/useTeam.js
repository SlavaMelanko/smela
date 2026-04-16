import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { defaultOptions } from '@ui/components/Pagination'
import { authKeys } from '@ui/hooks/useAuth'
import { UserStatus } from '@ui/lib/types'
import { teamApi } from '@ui/services/backend'

export const teamKeys = {
  all: () => ['teams'],
  teams: () => [...teamKeys.all(), 'teams'],
  teamsList: params => [...teamKeys.teams(), 'list', params],
  team: id => [...teamKeys.teams(), id],
  members: teamId => [...teamKeys.team(teamId), 'members'],
  member: (teamId, memberId) => [...teamKeys.members(teamId), memberId],
  memberDefaultPermissions: teamId => [
    ...teamKeys.members(teamId),
    'defaultPermissions'
  ]
}

// Admin: always fresh — browsing multiple teams in real time.
const teamQueryOptions = {
  staleTime: 0,
  gcTime: 60 * 1000,
  refetchOnWindowFocus: true
}

// User: less strict — team data is not expected to change often, and can be kept in cache.
export const userTeamQueryOptions = {
  ...teamQueryOptions,
  staleTime: 100 * 1000, // 100 seconds
  gcTime: 5 * 60 * 1000 // 5 minutes
}

export const useTeams = (params = {}) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: teamKeys.teamsList(params),
    queryFn: () => teamApi.listTeams(params),
    placeholderData: keepPreviousData,
    ...teamQueryOptions
  })

  return {
    teams: data?.teams ?? [],
    pagination: data?.pagination ?? defaultOptions,
    isPending,
    isError,
    error,
    refetch
  }
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => teamApi.createTeam(data),
    onMutate: async newTeam => {
      await queryClient.cancelQueries({ queryKey: teamKeys.all() })

      const previousTeams = queryClient.getQueryData(teamKeys.teamsList({}))

      queryClient.setQueryData(teamKeys.teamsList({}), old => {
        const now = new Date().toISOString()
        const optimisticTeam = {
          ...newTeam,
          id: `temp-${now}`,
          createdAt: now,
          updatedAt: now
        }

        const teams = old?.teams ?? []

        const pagination = old?.pagination ?? defaultOptions

        return {
          teams: [optimisticTeam, ...teams],
          pagination: {
            ...pagination,
            total: pagination.total + 1
          }
        }
      })

      return { previousTeams }
    },
    onError: (_error, _newTeam, context) => {
      queryClient.setQueryData(teamKeys.teamsList({}), context.previousTeams)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.teams() })
    }
  })
}

export const useTeam = (id, options = {}) => {
  return useQuery({
    queryKey: teamKeys.team(id),
    queryFn: () => teamApi.getTeam(id),
    select: data => data?.team,
    enabled: !!id,
    ...teamQueryOptions,
    ...options
  })
}

export const useUpdateTeam = teamId => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => teamApi.updateTeam(teamId, data),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.team(teamId),
        exact: true
      })

      queryClient.setQueryData(authKeys.user(), old => {
        if (!old?.team) {
          return old
        }

        return { ...old, team: { ...old.team, name: data.team.name } }
      })
    }
  })
}

export const useTeamMembers = (teamId, options = {}) => {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => teamApi.getMembers(teamId),
    select: data => data?.members ?? [],
    enabled: !!teamId,
    ...teamQueryOptions,
    ...options
  })
}

export const useTeamMemberDefaultPermissions = teamId => {
  return useQuery({
    queryKey: teamKeys.memberDefaultPermissions(teamId),
    queryFn: () => teamApi.getMemberDefaultPermissions(teamId),
    select: data => data?.permissions,
    enabled: !!teamId,
    ...teamQueryOptions
  })
}

export const useTeamMember = (teamId, memberId, options = {}) => {
  return useQuery({
    queryKey: teamKeys.member(teamId, memberId),
    queryFn: () => teamApi.getMember(teamId, memberId),
    select: data => data?.member,
    enabled: !!teamId && !!memberId,
    ...teamQueryOptions,
    ...options
  })
}

export const useInviteMember = teamId => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => teamApi.inviteMember(teamId, data),
    onMutate: async newMember => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members(teamId) })

      const previousMembers = queryClient.getQueryData(teamKeys.members(teamId))

      queryClient.setQueryData(teamKeys.members(teamId), old => {
        const optimisticMember = {
          ...newMember,
          id: `...`,
          status: UserStatus.Pending
        }

        const currentMembers = old?.members ?? []

        return { members: [optimisticMember, ...currentMembers] }
      })

      return { previousMembers }
    },
    onError: (_error, _newMember, context) => {
      queryClient.setQueryData(
        teamKeys.members(teamId),
        context.previousMembers
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.team(teamId) })
    }
  })
}

export const useUpdateTeamMember = (teamId, memberId, selfId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => teamApi.updateMember(teamId, memberId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) })

      // Sync /me cache to avoid a full refetch and UI blink
      if (memberId === selfId) {
        queryClient.setQueryData(authKeys.user(), cached => {
          if (!cached) {
            return cached
          }

          return {
            ...cached,
            ...(variables.member && {
              user: { ...cached.user, ...variables.member }
            }),
            ...(variables.membership &&
              cached.team && {
                team: { ...cached.team, ...variables.membership }
              })
          }
        })
      }
    }
  })
}

export const useResendMemberInvite = teamId => {
  return useMutation({
    mutationFn: memberId => teamApi.resendInvite(teamId, memberId)
  })
}

export const useCancelMemberInvite = teamId => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: memberId => teamApi.cancelInvite(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) })
    }
  })
}

export const useRemoveMember = teamId => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: memberId => teamApi.deleteMember(teamId, memberId),
    onMutate: async memberId => {
      await queryClient.cancelQueries({ queryKey: teamKeys.members(teamId) })
      await queryClient.cancelQueries({
        queryKey: teamKeys.team(teamId),
        exact: true
      })

      const previousMembers = queryClient.getQueryData(teamKeys.members(teamId))
      const previousTeam = queryClient.getQueryData(teamKeys.team(teamId))

      queryClient.setQueryData(teamKeys.members(teamId), old => {
        const currentMembers = old?.members ?? []

        return { members: currentMembers.filter(m => m.id !== memberId) }
      })

      queryClient.setQueryData(teamKeys.team(teamId), old => {
        if (!old?.team) {
          return old
        }

        return {
          team: {
            ...old.team,
            memberCount: Math.max(0, old.team.memberCount - 1)
          }
        }
      })

      return { previousMembers, previousTeam }
    },
    onError: (_error, _memberId, context) => {
      queryClient.setQueryData(
        teamKeys.members(teamId),
        context.previousMembers
      )

      queryClient.setQueryData(teamKeys.team(teamId), context.previousTeam)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) })
      queryClient.invalidateQueries({
        queryKey: teamKeys.team(teamId),
        exact: true
      })
    }
  })
}
