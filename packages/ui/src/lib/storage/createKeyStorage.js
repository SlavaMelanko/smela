import { localStorage } from './localStorage'

export const createKeyStorage = key => ({
  get: () => localStorage.get(key),
  set: value => localStorage.set(key, value),
  remove: () => localStorage.remove(key)
})
