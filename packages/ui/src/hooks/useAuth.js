import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accessTokenStorage } from '@ui/lib/storage'
import { authApi, userApi } from '@ui/services/backend'
import {
  clearUser as clearErrorTrackerUser,
  setUser as setErrorTrackerUser
} from '@ui/services/errorTracker'

export const authKeys = {
  all: () => ['auth'],
  user: () => [...authKeys.all(), 'user'],
  invitation: token => [...authKeys.all(), 'invitation', token]
}

export const useCurrentUser = (options = {}) => {
  const hasAccessToken = !!accessTokenStorage.get()

  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: userApi.getCurrentUser,
    enabled: hasAccessToken,
    ...options
  })

  return {
    isPending: hasAccessToken ? query.isPending : false,
    isFetching: query.isFetching,
    isError: hasAccessToken ? query.isError : false,
    error: query.error,
    isSuccess: hasAccessToken ? query.isSuccess : false,
    user: query.data?.user ?? null,
    team: query.data?.team ?? null,
    permissions: query.data?.permissions ?? [],
    isAuthenticated: !!query.data?.user
  }
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logIn,
    onSuccess: data => {
      accessTokenStorage.set(data.accessToken)

      if (data?.user) {
        const { user, team } = data

        queryClient.setQueryData(authKeys.user(), { user, team })

        setErrorTrackerUser(user)
      } else {
        // No user in response, fetch from /me endpoint
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
    }
  })
}

export const useLoginWithGoogle = () =>
  useMutation({
    mutationFn: async () => {
      // Temporary implementation until Google OAuth is implemented
      throw new Error('Google login not implemented for backend API yet')
    },
    meta: {
      // When implemented, this will invalidate queries to refetch user data
      invalidatesQueries: authKeys.user()
    }
  })

export const useUserSignupWithEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: data => {
      accessTokenStorage.set(data.accessToken)

      if (data?.user) {
        const { user, team } = data

        queryClient.setQueryData(authKeys.user(), { user, team })

        setErrorTrackerUser(user)
      } else {
        // No user in response, fetch from /me endpoint
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
    }
  })
}

export const useUserSignupWithGoogle = () =>
  useMutation({
    mutationFn: async () => {
      // Temporary implementation until Google OAuth is implemented
      throw new Error('Google signup not implemented for backend API yet')
    },
    meta: {
      // When implemented, this will invalidate queries to refetch user data
      invalidatesQueries: authKeys.user()
    }
  })

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logOut,
    meta: {
      invalidatesQueries: authKeys.all()
    },
    onSuccess: () => {
      accessTokenStorage.remove()

      queryClient.removeQueries({ queryKey: authKeys.user() })

      clearErrorTrackerUser()
    }
  })
}

export const useVerifyEmail = ({ onSettled }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: data => {
      accessTokenStorage.set(data.accessToken)

      if (data?.user) {
        const { user, team } = data

        queryClient.setQueryData(authKeys.user(), { user, team })

        setErrorTrackerUser(user)
      } else {
        // No user in response, fetch from /me endpoint
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
    },
    onSettled
  })
}

export const useResendVerificationEmail = () =>
  useMutation({
    mutationFn: authApi.resendVerificationEmail
  })

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: authApi.requestPasswordReset
  })

export const useResetPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: data => {
      accessTokenStorage.set(data.accessToken)

      if (data?.user) {
        const { user, team } = data

        queryClient.setQueryData(authKeys.user(), { user, team })

        setErrorTrackerUser(user)
      } else {
        // No user in response, fetch from /me endpoint
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
    }
  })
}

export const useCheckInvite = token =>
  useQuery({
    queryKey: authKeys.invitation(token),
    queryFn: () => authApi.checkInvite(token),
    select: response => response.data,
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: 0
  })

export const useAcceptInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.acceptInvite,
    onSuccess: data => {
      accessTokenStorage.set(data.accessToken)

      if (data?.user) {
        const { user, team } = data

        queryClient.setQueryData(authKeys.user(), { user, team })

        setErrorTrackerUser(user)
      } else {
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
    }
  })
}

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: userApi.updatePassword
  })

export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.updateUser,
    onMutate: async newUserData => {
      // Cancel any in-flight queries for the user
      await queryClient.cancelQueries({ queryKey: authKeys.user() })

      // Snapshot the previous user data
      const previousUser = queryClient.getQueryData(authKeys.user())

      // Optimistically update the user data
      queryClient.setQueryData(authKeys.user(), cachedUser => {
        if (!cachedUser) {
          return cachedUser
        }

        return {
          ...cachedUser,
          user: { ...cachedUser.user, ...newUserData }
        }
      })

      // Return context with snapshot for potential rollback
      return { previousUser }
    },
    onError: (_error, _newUserData, context) => {
      // Rollback to the previous user data on error
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.user(), context.previousUser)
      }
    },
    meta: {
      invalidatesQueries: authKeys.user(),
      refetchType: 'none'
    }
  })
}
