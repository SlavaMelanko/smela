import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { defaultOptions } from '@ui/components/Pagination'
import { UserStatus } from '@ui/lib/types'
import { ownerApi } from '@ui/services/backend'

export const ownerKeys = {
  all: () => ['owner'],
  admins: () => [...ownerKeys.all(), 'admins'],
  adminsList: params => [...ownerKeys.admins(), 'list', params],
  admin: id => [...ownerKeys.admins(), id],
  adminDefaultPermissions: () => [...ownerKeys.admins(), 'defaultPermissions'],
  adminPermissions: id => [...ownerKeys.admin(id), 'permissions']
}

// Owner queries need fresh data — new registrations or user updates
// should be visible immediately, not cached for minutes
const ownerQueryOptions = {
  staleTime: 0,
  gcTime: 60 * 1000, // 1 minute
  refetchOnWindowFocus: true
}

export const useAdmins = (params = {}) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ownerKeys.adminsList(params),
    queryFn: () => ownerApi.getAdmins(params),
    placeholderData: keepPreviousData,
    ...ownerQueryOptions
  })

  return {
    admins: data?.admins ?? [],
    pagination: data?.pagination ?? defaultOptions,
    isPending,
    isError,
    error,
    refetch
  }
}

export const useAdmin = id => {
  return useQuery({
    queryKey: ownerKeys.admin(id),
    queryFn: () => ownerApi.getAdmin(id),
    select: data => data?.admin,
    enabled: !!id,
    ...ownerQueryOptions
  })
}

export const useUpdateAdmin = id => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => ownerApi.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.admins() })
    }
  })
}

export const useCreateAdmin = () => {
  const queryClient = useQueryClient()
  const queryKey = ownerKeys.admins()

  return useMutation({
    mutationFn: ownerApi.createAdmin,
    onMutate: async newAdmin => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData({ queryKey }, old => {
        const now = new Date().toISOString()
        const optimisticAdmin = {
          ...newAdmin,
          id: '...',
          status: UserStatus.Pending,
          createdAt: now,
          updatedAt: now
        }

        return {
          ...old,
          admins: [optimisticAdmin, ...(old.admins ?? [])]
        }
      })

      return { previous }
    },
    onError: (_error, _newAdmin, context) => {
      for (const [queryKey, data] of context.previous) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

export const useResendAdminInvite = () => {
  return useMutation({
    mutationFn: ownerApi.resendAdminInvite
  })
}

export const useCancelAdminInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ownerApi.cancelAdminInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.admins() })
    }
  })
}

export const useAdminDefaultPermissions = () => {
  return useQuery({
    queryKey: ownerKeys.adminDefaultPermissions(),
    queryFn: ownerApi.getAdminDefaultPermissions,
    select: data => data?.permissions,
    ...ownerQueryOptions
  })
}

export const useAdminPermissions = id => {
  return useQuery({
    queryKey: ownerKeys.adminPermissions(id),
    queryFn: () => ownerApi.getAdminPermissions(id),
    select: data => data?.permissions,
    enabled: !!id,
    ...ownerQueryOptions
  })
}

export const useUpdateAdminPermissions = id => {
  const queryClient = useQueryClient()
  const queryKey = ownerKeys.adminPermissions(id)

  return useMutation({
    mutationFn: data => ownerApi.updateAdminPermissions(id, data),
    onMutate: async data => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, data)

      return { previous }
    },
    onError: (_error, _data, context) => {
      queryClient.setQueryData(queryKey, context.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}
