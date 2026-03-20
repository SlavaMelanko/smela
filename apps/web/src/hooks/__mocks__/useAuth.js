import { fn } from 'storybook/test'

export const authKeys = {
  all: () => ['auth'],
  user: () => [...authKeys.all(), 'user'],
  invitation: token => [...authKeys.all(), 'invitation', token]
}

export const useCurrentUser = fn(() => ({
  isPending: false,
  isFetching: false,
  isError: false,
  error: null,
  isSuccess: true,
  user: null,
  isAuthenticated: false
})).mockName('useCurrentUser')

export const useLogout = fn(() => ({
  mutate: fn(),
  isPending: false
})).mockName('useLogout')
