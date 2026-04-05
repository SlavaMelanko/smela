import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { defaultOptions } from '@ui/components/Pagination'
import { adminApi } from '@ui/services/backend'

export const adminKeys = {
  all: () => ['admin'],
  users: () => [...adminKeys.all(), 'users'],
  usersList: params => [...adminKeys.users(), 'list', params],
  userDetail: id => [...adminKeys.users(), 'detail', id]
}

// Admin queries need fresh data — new registrations or user updates
// should be visible immediately, not cached for minutes
const adminQueryOptions = {
  staleTime: 0,
  gcTime: 60 * 1000, // 1 minute
  refetchOnWindowFocus: true
}

export const useUsers = (params = {}) => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: adminKeys.usersList(params),
    queryFn: () => adminApi.getUsers(params),
    placeholderData: keepPreviousData,
    ...adminQueryOptions
  })

  return {
    users: data?.users ?? [],
    pagination: data?.pagination ?? defaultOptions,
    isPending,
    isError,
    error,
    refetch
  }
}

export const useUser = (id, options = {}) => {
  return useQuery({
    queryKey: adminKeys.userDetail(id),
    queryFn: () => adminApi.getUserById(id),
    select: data => data?.user,
    enabled: !!id,
    ...adminQueryOptions,
    ...options
  })
}

export const useUpdateUser = id => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(id) })
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    }
  })
}
