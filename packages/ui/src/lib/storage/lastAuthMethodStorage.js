import { localStorage } from './localStorage'

const LAST_AUTH_METHOD_KEY = 'last_auth_method'

export const AuthMethod = {
  Email: 'email',
  Google: 'google'
}

export const lastAuthMethodStorage = {
  get() {
    return localStorage.get(LAST_AUTH_METHOD_KEY)
  },

  set(value) {
    localStorage.set(LAST_AUTH_METHOD_KEY, value)
  },

  remove() {
    localStorage.remove(LAST_AUTH_METHOD_KEY)
  }
}
