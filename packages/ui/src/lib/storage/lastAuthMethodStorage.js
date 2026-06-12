import { createKeyStorage } from './createKeyStorage'

export const AuthMethod = {
  Email: 'email',
  Google: 'google'
}

export const lastAuthMethodStorage = createKeyStorage('last_auth_method')

export const wasLastAuthMethod = method =>
  lastAuthMethodStorage.get() === method
