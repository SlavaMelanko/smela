import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { systemApi } from '@ui/services/backend'

export const systemKeys = {
  all: () => ['system'],
  emailSenderProfiles: () => [...systemKeys.all(), 'emailSenderProfiles'],
  emailSenderProfile: profile => [...systemKeys.emailSenderProfiles(), profile]
}

// Rarely changes — safe to cache longer than admin-facing team/user data.
const systemQueryOptions = {
  staleTime: 100 * 1000, // 100 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true
}

export const useEmailSenderProfiles = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: systemKeys.emailSenderProfiles(),
    queryFn: () => systemApi.listEmailSenderProfiles(),
    ...systemQueryOptions
  })

  return {
    senderProfiles: data?.senderProfiles ?? [],
    isPending,
    isError,
    error,
    refetch
  }
}

export const useEmailSenderProfile = (profile, options = {}) => {
  return useQuery({
    queryKey: systemKeys.emailSenderProfile(profile),
    queryFn: () => systemApi.getEmailSenderProfile(profile),
    select: data => data?.senderProfile,
    enabled: !!profile,
    ...systemQueryOptions,
    ...options
  })
}

export const useUpdateEmailSenderProfile = profile => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => systemApi.updateEmailSenderProfile(profile, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemKeys.emailSenderProfile(profile),
        exact: true
      })

      queryClient.invalidateQueries({
        queryKey: systemKeys.emailSenderProfiles(),
        exact: true
      })
    }
  })
}
