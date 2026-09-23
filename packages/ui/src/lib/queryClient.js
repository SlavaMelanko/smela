import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { getNetworkErrorType, HttpStatus, isNetworkError } from '@ui/lib/net'
import { withQuery } from '@ui/lib/url'
import { captureError } from '@ui/services/errorTracker'

const getRetryDelay = attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000) // max 30 seconds

const redirectToNetworkErrorPage = error => {
  const path = '/errors/network'

  if (!window.location.pathname.includes(path)) {
    const errorType = getNetworkErrorType(error)

    window.location.href = withQuery(path, { errorType })
  }
}

const redirectToLogin = params => {
  const path = '/login'

  if (!window.location.pathname.includes(path)) {
    window.location.href = withQuery(path, params)
  }
}

const handleError = error => {
  if (isNetworkError(error)) {
    redirectToNetworkErrorPage(error)

    return
  }

  if (
    error?.status === HttpStatus.BAD_REQUEST &&
    error?.code === 'refresh-token/missing'
  ) {
    queryClient.clear()
    redirectToLogin({ info: error.code })

    return
  }

  captureError(error)
}

const queryCache = new QueryCache({
  onError: handleError
})

const mutationCache = new MutationCache({
  onError: handleError,
  onSettled: (_data, _error, _variables, _context, mutation) => {
    const { invalidatesQueries, refetchType } = mutation.meta ?? {}

    // refetchType 'none' marks queries stale without an active refetch,
    // so optimistically updated data is reconciled on next mount
    if (invalidatesQueries) {
      queryClient.invalidateQueries({
        queryKey: invalidatesQueries,
        ...(refetchType && { refetchType })
      })
    }
  }
})

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time: how long until data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time: how long data stays in cache after component unmounts
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (
          error?.status >= HttpStatus.BAD_REQUEST &&
          error?.status < HttpStatus.INTERNAL_SERVER_ERROR
        ) {
          return false
        }

        // Retry up to 2 times for other errors
        return failureCount < 2
      },
      // Add exponential backoff delay
      retryDelay: getRetryDelay,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always'
    },
    mutations: {
      // Retry failed mutations
      retry: false
    }
  }
})
