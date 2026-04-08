import { localStorage } from './localStorage'

const ACCESS_TOKEN_KEY = 'access_token'

export const accessTokenStorage = {
  get() {
    return localStorage.get(ACCESS_TOKEN_KEY)
  },

  set(value) {
    localStorage.set(ACCESS_TOKEN_KEY, value)
  },

  remove() {
    localStorage.remove(ACCESS_TOKEN_KEY)
  }
}
