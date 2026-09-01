import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { systemApi } from '@ui/services/backend'

export const systemKeys = {
  all: () => ['system'],
  emailSenderProfiles: () => [...systemKeys.all(), 'emailSenderProfiles'],
  emailSenderProfile: profile => [...systemKeys.emailSenderProfiles(), profile],
  socialLinks: () => [...systemKeys.all(), 'socialLinks'],
  socialLink: network => [...systemKeys.socialLinks(), network]
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

export const useSocialLinks = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: systemKeys.socialLinks(),
    queryFn: () => systemApi.listSocialLinks(),
    ...systemQueryOptions
  })

  return {
    socialLinks: data?.socialLinks ?? [],
    isPending,
    isError,
    error,
    refetch
  }
}

export const useSocialLink = (network, options = {}) => {
  return useQuery({
    queryKey: systemKeys.socialLink(network),
    queryFn: () => systemApi.getSocialLink(network),
    select: data => data?.socialLink,
    enabled: !!network,
    ...systemQueryOptions,
    ...options
  })
}

export const useUpdateSocialLink = network => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => systemApi.updateSocialLink(network, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: systemKeys.socialLink(network),
        exact: true
      })

      queryClient.invalidateQueries({
        queryKey: systemKeys.socialLinks(),
        exact: true
      })
    }
  })
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
