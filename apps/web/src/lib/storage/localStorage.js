export const localStorage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key)

      return value !== null ? value : fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  },

  clear() {
    try {
      window.localStorage.clear()
    } catch {
      // Fail silently (e.g., quota exceeded, private mode)
    }
  }
}
